"use server";

import { z } from "zod";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { shippingMethods } from "@/lib/shipping";
import { siteUrl } from "@/lib/site";

// A curated list rather than every ISO country code Stripe supports —
// matches the markets the existing shipping tiers ("White-Glove",
// "International Air Freight") were actually written for (EU/EEA, UK,
// North America, a handful of other developed markets). Easy to extend;
// not worth enumerating all ~240 codes for a boutique lighting business
// with no stated ambition to ship literally everywhere yet.
const ALLOWED_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
  [
    "AD", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
    "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "MC", "NL", "NO", "PL",
    "PT", "RO", "SK", "SI", "ES", "SE", "CH", "GB", "US", "CA", "AU", "NZ",
    "JP", "SG", "AE", "IS",
  ];

const createCheckoutSessionSchema = z.object({
  // Only the slug + quantity come from the client — price and name are
  // looked up server-side so a tampered request can't under-charge or
  // misrepresent what was actually ordered. Same anti-tampering reasoning
  // the old placeOrder() used.
  items: z.array(z.object({ slug: z.string().min(1), qty: z.number().int().positive() })).min(1),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreateCheckoutSessionResult = { url: string } | { error: string };

// Replaces the old placeOrder() action, which wrote an Order row directly
// from the client-submitted form before any money had actually changed
// hands. Stripe Checkout collects the shipping address, lets the customer
// pick a shipping tier, calculates tax, and takes payment on its own
// hosted page — this action's only job is building that session and
// handing back the URL to redirect to. The Order row itself is created by
// the webhook (see src/app/api/stripe/webhook/route.ts) once Stripe
// confirms the payment actually succeeded, not by this action or by the
// browser reaching a "success" URL on its own (which anyone could visit
// without paying).
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionResult> {
  const parsed = createCheckoutSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Your cart looks empty — add something before checking out." };
  }

  const slugs = parsed.data.items.map((i) => i.slug);
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

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: parsed.data.items.map((item) => {
        const product = bySlug.get(item.slug)!;
        return {
          quantity: item.qty,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(product.price * 100),
            product_data: { name: product.name, metadata: { slug: item.slug } },
          },
        };
      }),
      // Stripe Tax — calculated automatically from the shipping address the
      // customer enters on the Checkout page itself.
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: ALLOWED_SHIPPING_COUNTRIES },
      // The three existing shipping tiers, carried over as real Stripe
      // shipping-rate options the customer chooses between on Stripe's
      // page — same labels/prices as before, just now actually charged.
      shipping_options: shippingMethods.map((method) => ({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Math.round(method.price * 100), currency: "eur" },
          display_name: method.label,
          delivery_estimate: {
            minimum: { unit: "week", value: 1 },
            maximum: { unit: "week", value: 12 },
          },
        },
      })),
      metadata: { items: JSON.stringify(parsed.data.items) },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    if (!session.url) {
      return { error: "Something went wrong starting checkout. Please try again." };
    }
    return { url: session.url };
  } catch {
    return { error: "Something went wrong starting checkout. Please try again." };
  }
}
