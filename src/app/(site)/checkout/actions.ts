"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { shippingMethods } from "@/lib/shipping";

const placeOrderSchema = z.object({
  customerName: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Enter a valid email"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  region: z.string().optional(),
  postal: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  shippingMethodId: z.string().min(1, "Required"),
  // Only the slug + quantity come from the client — price and name are
  // looked up server-side so a tampered request can't under-charge or
  // misrepresent what was actually ordered.
  items: z.array(z.object({ slug: z.string().min(1), qty: z.number().int().positive() })).min(1),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type PlaceOrderResult = { orderNumber: string } | { error: string };

function generateOrderNumber() {
  return `SFL-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Something's missing from your order — please check the form and try again." };
  }
  const data = parsed.data;

  const method = shippingMethods.find((m) => m.id === data.shippingMethodId);
  if (!method) {
    return { error: "That delivery method is no longer available — please choose another." };
  }

  const slugs = data.items.map((i) => i.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true, price: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return {
      error: "One or more items in your cart are no longer available. Please review your cart and try again.",
    };
  }

  const orderItems = data.items.map((i) => {
    const product = bySlug.get(i.slug)!;
    return { slug: i.slug, name: product.name, price: product.price, qty: i.qty };
  });
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal + method.price;

  // Order numbers are random and unique-constrained — retry a few times on
  // the astronomically unlikely chance of a collision rather than adding
  // sequence-table complexity for a six-digit code.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: data.customerName,
          email: data.email,
          address: data.address,
          city: data.city,
          region: data.region || null,
          postal: data.postal,
          country: data.country,
          items: orderItems,
          subtotal,
          shippingMethod: method.label,
          shippingCost: method.price,
          total,
          status: "NEW",
        },
      });
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
      return { orderNumber: order.orderNumber };
    } catch (err) {
      const isUniqueViolation =
        typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
      if (!isUniqueViolation) throw err;
      // Collision on orderNumber — loop and try a fresh one.
    }
  }

  return { error: "Something went wrong placing your order. Please try again." };
}
