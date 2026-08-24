import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getShippingLabel, type ShippingSpeed } from "@/lib/shipping";

// The only thing that's allowed to create an Order row for a Stripe-paid
// purchase — never the browser reaching /checkout/success on its own
// (anyone could type that URL without paying), and never the
// createCheckoutSession action (that runs before payment even happens).
// Stripe signs every webhook request with STRIPE_WEBHOOK_SECRET, verified
// below, so this is the one place we can actually trust "a customer paid"
// as fact rather than a claim.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Fails loudly rather than silently accepting unverified webhook
    // traffic if the secret was never configured.
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Signature verification needs the exact raw bytes Stripe sent — not a
  // JSON-parsed-and-restringified body, which wouldn't match the HMAC.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Every other event type this endpoint might receive (Stripe sends
    // whatever the dashboard's webhook config is subscribed to) is simply
    // not relevant to order creation — acknowledged so Stripe doesn't
    // retry it as failed.
    return NextResponse.json({ received: true });
  }

  // Stripe's SDK types Event.data.object as a broad union across every
  // resource type it can carry, not narrowed by event.type — the check
  // above is what actually guarantees this is a Checkout Session at
  // runtime, so the cast here is safe.
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  // stripeSessionId is unique-constrained — if this webhook is retried
  // (Stripe does this whenever it doesn't get a 200 back in time), the
  // create below throws a unique-violation, which is caught and treated
  // as "already handled" rather than a real failure.
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  let items: { slug: string; qty: number }[] = [];
  try {
    items = JSON.parse(session.metadata?.items ?? "[]");
  } catch {
    // Malformed metadata shouldn't happen (we control what's written to
    // it), but falling back to an empty list beats crashing the webhook.
  }

  const slugs = items.map((i) => i.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true, price: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const orderItems = items
    .filter((i) => bySlug.has(i.slug))
    .map((i) => {
      const product = bySlug.get(i.slug)!;
      return { slug: i.slug, name: product.name, price: product.price, qty: i.qty };
    });

  const address = session.collected_information?.shipping_details?.address ?? session.customer_details?.address;
  const shippingName =
    session.collected_information?.shipping_details?.name ?? session.customer_details?.name ?? "Customer";

  const orderNumber = `SFL-${Math.floor(100000 + Math.random() * 900000)}`;

  // The webhook payload never expands shipping_cost.shipping_rate (event
  // objects don't support the `expand` param the way direct API calls do) —
  // it only ever arrives as a rate ID string, not the object with its
  // display_name. The speed was recorded in the session's own metadata
  // when it was created, so that's used to rebuild the same label instead
  // of an extra API call to look the rate up.
  const shippingCostAmount = Math.round((session.shipping_cost?.amount_total ?? 0) / 100);
  const shippingSpeed = session.metadata?.shippingSpeed;
  const shippingLabel =
    shippingSpeed === "regular" || shippingSpeed === "express"
      ? getShippingLabel(shippingSpeed as ShippingSpeed)
      : "Shipping";

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: shippingName,
        email: session.customer_details?.email ?? "",
        address: [address?.line1, address?.line2].filter(Boolean).join(", ") || "—",
        city: address?.city ?? "—",
        region: address?.state ?? null,
        postal: address?.postal_code ?? "—",
        country: address?.country ?? "—",
        items: orderItems,
        subtotal: Math.round((session.amount_subtotal ?? 0) / 100),
        shippingMethod: shippingLabel,
        shippingCost: shippingCostAmount,
        taxAmount: Math.round((session.total_details?.amount_tax ?? 0) / 100),
        total: Math.round((session.amount_total ?? 0) / 100),
        status: "NEW",
        stripeSessionId: session.id,
      },
    });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return NextResponse.json({ received: true, orderNumber: order.orderNumber });
  } catch (err) {
    const isUniqueViolation =
      typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
    if (isUniqueViolation) {
      // Lost a race with another delivery of the same webhook event.
      return NextResponse.json({ received: true });
    }
    throw err;
  }
}
