"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OrderStatusValue } from "@/lib/order-status";
import { orderStatuses } from "@/lib/order-status";
import { sendShippedEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { getSession } from "@/lib/get-session";

type OrderItem = { slug: string; name: string; price: number; qty: number };

function parseOrderItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (i): i is OrderItem =>
      typeof i === "object" &&
      i !== null &&
      typeof (i as OrderItem).slug === "string" &&
      typeof (i as OrderItem).qty === "number"
  );
}

// Logs one OUT movement per line item and decrements stock — called only
// on the transition INTO "SHIPPED", never on a later edit to tracking
// info, so re-saving tracking details can't double-deduct.
async function deductStockForShippedOrder(order: { id: string; items: unknown }): Promise<void> {
  const items = parseOrderItems(order.items);
  if (items.length === 0) return;

  const products = await prisma.product.findMany({
    where: { slug: { in: items.map((i) => i.slug) } },
    select: { id: true, slug: true },
  });
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const session = await getSession();

  for (const item of items) {
    const product = productBySlug.get(item.slug);
    // A product can be renamed/deleted after the order was placed — the
    // order itself still records what was actually sold either way, so a
    // missing product here just means there's nothing left to deduct from.
    if (!product) continue;

    await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "OUT",
          quantity: item.qty,
          orderId: order.id,
          loggedBy: session?.name ?? null,
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: { decrement: item.qty } },
      }),
    ]);
  }
}

export async function updateOrderStatus(id: string, status: OrderStatusValue) {
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

const trackingSchema = z.object({
  id: z.string().min(1),
  trackingNumber: z.string().min(1, "Required"),
  trackingUrl: z.string().min(1, "Required").url("Enter a valid tracking URL."),
});

export type TrackingFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

// Sets the order to SHIPPED, saves the tracking info, and emails the
// customer the tracking link — one action for "easy to use" (the admin
// asked for exactly this: fill in tracking, notify the customer, done)
// rather than separate save-then-notify steps.
export async function markOrderShipped(
  _prevState: TrackingFormState,
  formData: FormData
): Promise<TrackingFormState> {
  const parsed = trackingSchema.safeParse({
    id: formData.get("id"),
    trackingNumber: formData.get("trackingNumber"),
    trackingUrl: formData.get("trackingUrl"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }
  const { id } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { error: "Order not found." };
  const wasAlreadyShipped = order.status === "SHIPPED";

  // shippedEmailSentAt is deliberately NOT set here — only once the send
  // below actually succeeds, so the admin UI's "Customer notified" state
  // can never be true for an email that never went out.
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: "SHIPPED",
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl: parsed.data.trackingUrl,
    },
  });

  // Only on the actual transition into "shipped" — re-saving tracking
  // info (the "Edit tracking info" path) hits this same action again but
  // shouldn't deduct stock a second time for the same order.
  if (!wasAlreadyShipped) {
    await deductStockForShippedOrder(updated);
  }

  try {
    await sendShippedEmail({
      orderNumber: updated.orderNumber,
      email: updated.email,
      customerName: updated.customerName,
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl: parsed.data.trackingUrl,
    });
  } catch (err) {
    console.error("Failed to send shipped email:", err);
    // Status and tracking info were still saved — reflect that in the UI
    // even though the notification itself didn't go out.
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin");
    revalidatePath("/admin/warehouse");
    return {
      error:
        "Tracking info was saved and the order marked shipped, but the notification email failed to send. You can try resending it below.",
    };
  }

  await prisma.order.update({ where: { id }, data: { shippedEmailSentAt: new Date() } });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/warehouse");
  return { success: true };
}

// For re-sending the notification without re-entering tracking info — e.g.
// after fixing an email-provider issue, or if the customer says they never
// got it.
export async function resendShippedEmail(id: string): Promise<{ error?: string }> {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { error: "Order not found." };
  if (!order.trackingNumber || !order.trackingUrl) {
    return { error: "No tracking info saved for this order yet." };
  }

  await sendShippedEmail({
    orderNumber: order.orderNumber,
    email: order.email,
    customerName: order.customerName,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
  });

  await prisma.order.update({ where: { id }, data: { shippedEmailSentAt: new Date() } });
  revalidatePath(`/admin/orders/${id}`);
  return {};
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

const manualOrderItemSchema = z.object({
  // Empty for a free-text/custom line item (no matching Product row) —
  // deductStockForShippedOrder already treats an unmatched slug as "no
  // stock to touch" rather than erroring, and the order detail page's
  // item parser only requires this field to be a string, not non-empty,
  // so both stay correct with slug left blank here.
  slug: z.string(),
  name: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  qty: z.coerce.number().int().positive(),
});

const manualOrderSchema = z.object({
  customerName: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Enter a valid email."),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  region: z.string().optional(),
  postal: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  shippingCost: z.coerce.number().int().nonnegative(),
  taxAmount: z.coerce.number().int().nonnegative(),
  paymentMethod: z.string().min(1, "Required"),
  status: z.enum(orderStatuses),
  itemsJson: z.string().min(1),
});

export type ManualOrderState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

// For phone orders paid straight into the bank account — everything after
// this behaves exactly like a Stripe order (same Orders list, same
// shipping/tracking flow, same warehouse deduction on shipment, and —
// per the specific ask — the exact same confirmation email a Stripe order
// triggers), the only difference is who created the row and how it was
// paid. Unlike the retail/wholesale checkout actions, prices here are NOT
// re-verified against Product.price — the whole point of this form is
// letting an admin enter a phone-negotiated price, and the admin is
// already an authenticated, trusted party for this action.
export async function createManualOrder(
  _prevState: ManualOrderState,
  formData: FormData
): Promise<ManualOrderState> {
  const parsed = manualOrderSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    region: formData.get("region") || undefined,
    postal: formData.get("postal"),
    country: formData.get("country"),
    shippingCost: formData.get("shippingCost") || "0",
    taxAmount: formData.get("taxAmount") || "0",
    paymentMethod: formData.get("paymentMethod"),
    status: formData.get("status"),
    itemsJson: formData.get("itemsJson"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(parsed.data.itemsJson);
  } catch {
    return { error: "Add at least one item." };
  }
  const itemsParsed = z.array(manualOrderItemSchema).min(1, "Add at least one item.").safeParse(rawItems);
  if (!itemsParsed.success) {
    return { error: "Add at least one item, each with a name, price, and quantity." };
  }
  const items = itemsParsed.data;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal + parsed.data.shippingCost + parsed.data.taxAmount;
  const orderNumber = `SFL-${Math.floor(100000 + Math.random() * 900000)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: parsed.data.customerName,
      email: parsed.data.email,
      address: parsed.data.address,
      city: parsed.data.city,
      region: parsed.data.region || null,
      postal: parsed.data.postal,
      country: parsed.data.country,
      items,
      subtotal,
      shippingMethod: "Manual Order",
      shippingCost: parsed.data.shippingCost,
      taxAmount: parsed.data.taxAmount,
      total,
      status: parsed.data.status,
      paymentMethod: parsed.data.paymentMethod,
      stripeSessionId: null,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  try {
    await sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      email: order.email,
      customerName: order.customerName,
      items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      total: order.total,
    });
  } catch (err) {
    console.error("Failed to send order confirmation email for manual order:", err);
  }

  redirect(`/admin/orders/${order.id}`);
}
