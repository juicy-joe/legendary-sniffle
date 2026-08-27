"use server";

import { z } from "zod";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getShippingLabel, getShippingPrice, isShippableCountry } from "@/lib/shipping";
import { getShippingRates } from "@/lib/settings";
import { getWholesaleSession } from "@/lib/get-wholesale-session";
import { getApprovedWholesaleAccount, getWholesalePrice } from "@/lib/wholesale";
import { siteUrl } from "@/lib/site";

const schema = z.object({
  items: z.array(z.object({ slug: z.string().min(1), qty: z.number().int().positive() })).min(1),
  country: z.string().length(2),
  shippingSpeed: z.enum(["regular", "express"]),
});

export type CreateWholesaleCheckoutSessionInput = z.infer<typeof schema>;
export type CreateWholesaleCheckoutSessionResult = { url: string } | { error: string };

// Deliberate near-duplicate of createCheckoutSession (src/app/(site)/checkout/actions.ts)
// rather than a shared function with a "isWholesale" flag threaded through
// — the two price a line item completely differently (retail lookup vs.
// getWholesalePrice), and keeping them separate means a change to one
// checkout flow can't silently alter the other's pricing logic.
export async function createWholesaleCheckoutSession(
  input: CreateWholesaleCheckoutSessionInput
): Promise<CreateWholesaleCheckoutSessionResult> {
  const session = await getWholesaleSession();
  if (!session) return { error: "Your trade session has expired. Please log in again." };

  const account = await getApprovedWholesaleAccount(session.sub);
  if (!account) return { error: "Your trade session has expired. Please log in again." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: "Your order looks empty — add something before checking out." };
  }

  const { country, shippingSpeed } = parsed.data;
  if (!isShippableCountry(country)) {
    return { error: "Sorry, we don't currently ship to that country." };
  }

  const slugs = parsed.data.items.map((i) => i.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, name: true, price: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return {
      error: "One or more items in your order are no longer available. Please review and try again.",
    };
  }

  const stripe = getStripe();
  const rates = await getShippingRates();
  const shippingPrice = getShippingPrice(rates, country, shippingSpeed);

  try {
    const lineItems = await Promise.all(
      parsed.data.items.map(async (item) => {
        const product = bySlug.get(item.slug)!;
        const unitPrice = await getWholesalePrice(account, product.id, product.price);
        return {
          quantity: item.qty,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(unitPrice * 100),
            product_data: { name: product.name, metadata: { slug: item.slug } },
          },
        };
      })
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [country as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry],
      },
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
        // Read by the webhook to tag the resulting Order — the one thing
        // that distinguishes this from a retail checkout session once
        // it's in Stripe's hands.
        wholesaleAccountId: account.id,
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/trade/portal`,
    });

    if (!checkoutSession.url) {
      return { error: "Something went wrong starting checkout. Please try again." };
    }
    return { url: checkoutSession.url };
  } catch {
    return { error: "Something went wrong starting checkout. Please try again." };
  }
}
