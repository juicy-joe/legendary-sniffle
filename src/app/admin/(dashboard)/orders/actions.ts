"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { OrderStatusValue } from "@/lib/order-status";
import { sendShippedEmail } from "@/lib/email";

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

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: "SHIPPED",
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl: parsed.data.trackingUrl,
      shippedEmailSentAt: new Date(),
    },
  });

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
    return {
      error:
        "Tracking info was saved and the order marked shipped, but the notification email failed to send. You can try resending it below.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
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
