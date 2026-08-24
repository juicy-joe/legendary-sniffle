"use server";

import { z } from "zod";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getShippingLabel, getShippingPrice, isShippableCountry } from "@/lib/shipping";
import { getShippingRates } from "@/lib/settings";
import { siteUrl } from "@/lib/site";

const createCheckoutSessionSchema = z.object({
  // Only the slug + quantity come from the client — price and name are
  // looked up server-side so a tampered request can't under-charge or
  // misrepresent what was actually ordered. Same anti-tampering reasoning
  // the old placeOrder() used.
  items: z.array(z.object({ slug: z.string().min(1), qty: z.number().int().positive() })).min(1),
  // Chosen on our own checkout page, before Stripe is ever involved —
  // Stripe Checkout can't show/hide a shipping option based on the address
  // someone types into its own hosted page, so the destination has to be
  // known upfront to charge the right, single, non-negotiable price. The
  // country is re-validated below against the same allow-list the client
  // picked from, and re-priced from it — never trusting a client-submitted
  // price here either.
  country: z.string().length(2),
  shippingSpeed: z.enum(["regular", "express"]),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CreateCheckoutSessionResult = { url: string } | { error: string };

// Replaces the old placeOrder() action, which wrote an Order row directly
// from the client-submitted form before any money had actually changed
// hands. Stripe Checkout collects the rest of the shipping address and
// takes payment on its own hosted page — this action's only job is
// building that session and handing back the URL to redirect to. The Order
// row itself is created by the webhook (see
// src/app/api/stripe/webhook/route.ts) once Stripe confirms the payment
// actually succeeded, not by this action or by the browser reaching a
// "success" URL on its own (which anyone could visit without paying).
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionResult> {
  const parsed = createCheckoutSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Your cart looks empty — add something before checking out." };
  }

  const { country, shippingSpeed } = parsed.data;
  if (!isShippableCountry(country)) {
    return { error: "Sorry, we don't currently ship to that country." };
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
  // Re-fetched server-side rather than trusting a client-submitted price —
  // same anti-tampering reasoning as the product price lookup above.
  const rates = await getShippingRates();
  const shippingPrice = getShippingPrice(rates, country, shippingSpeed);

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
      // Locked to the single country already chosen on our own page, so
      // the address Stripe collects can't end up in a different region
      // than the one the shipping price above was actually calculated for.
      shipping_address_collection: {
        allowed_countries: [country as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry],
      },
      // A single, already-decided shipping price — not a menu of tiers for
      // the customer to pick between on Stripe's page, since the region
      // (and therefore the price) was fixed the moment they chose a
      // country above.
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: Math.round(shippingPrice * 100), currency: "eur" },
            display_name: getShippingLabel(shippingSpeed),
            delivery_estimate:
              shippingSpeed === "express"
                ? { minimum: { unit: "week", value: 1 }, maximum: { unit: "week", value: 3 } }
                : { minimum: { unit: "week", value: 2 }, maximum: { unit: "week", value: 12 } },
          },
        },
      ],
      metadata: {
        items: JSON.stringify(parsed.data.items),
        shippingSpeed,
        shippingCountry: country,
      },
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
