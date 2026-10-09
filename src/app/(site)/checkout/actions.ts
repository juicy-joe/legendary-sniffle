"use server";

import { z } from "zod";
import type Stripe from "stripe";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getShippingLabel, getShippingPrice, isShippableCountry } from "@/lib/shipping";
import { getShippingRates } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { getStockLevels } from "@/lib/stock-levels";

// How long a checkout attempt holds its stock before it's treated as
// abandoned and stops counting against availability. Matches the Stripe
// Checkout Session's own `expires_at` below, so a hold never outlives the
// session it belongs to (and never expires while that session could still
// be completed). 31, not 30 — Stripe's own minimum for expires_at is
// exactly 30 minutes from creation, and the few seconds this function
// spends on the DB transaction before calling Stripe would otherwise
// occasionally land just under that floor.
const HOLD_MINUTES = 31;

// Thrown only for the "insufficient stock" business-logic case inside the
// transaction below, so the catch block can tell it apart from a real
// serialization failure (which should get a different, retry-oriented
// message) without checking error message strings.
class CheckoutError extends Error {}

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
  // Marketing attribution captured client-side (see src/lib/attribution.ts)
  // — optional and unvalidated beyond being well-formed, since it's purely
  // informational reporting data, never used for pricing or any decision
  // that needs tamper-resistance.
  attribution: z
    .object({
      firstTouch: z.record(z.string(), z.unknown()).optional(),
      lastTouch: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
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
    select: { id: true, slug: true, name: true, price: true, sku: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    return {
      error: "One or more items in your cart are no longer available. Please review your cart and try again.",
    };
  }

  // Authoritative stock check + reservation, done together inside one
  // Serializable transaction — the cart/product-page UI never shows or
  // enforces stock at all (see AddToCartPanel/CartDrawer), so this is the
  // only place that actually has to stop an oversell. Serializable matters
  // here, not just a plain transaction: two requests for the last unit
  // could otherwise both read "1 available" before either has written
  // anything, and both proceed. Under Serializable, Postgres detects that
  // conflict and fails one of the two transactions outright (caught below
  // as a generic "please try again"), rather than letting both succeed.
  // The hold itself is what makes this different from the old check-only
  // version: without it, "available" wouldn't reflect this in-flight
  // attempt until the webhook creates a real Order after payment, which
  // could be minutes away — see CheckoutHold's schema comment.
  let holdId: string;
  try {
    holdId = await prisma.$transaction(
      async (tx) => {
        const stockLevels = await getStockLevels(tx);
        for (const item of parsed.data.items) {
          const product = bySlug.get(item.slug)!;
          const available = stockLevels.get(product.id)?.available ?? 0;
          if (item.qty > available) {
            // Deliberately generic — never discloses how many are actually
            // left. available === 0 and available > 0 but insufficient
            // both read the same to the customer; the only difference
            // internally is which sentence fits better.
            throw new CheckoutError(
              available > 0
                ? `The requested quantity for "${product.name}" is not fully available. Please reduce the quantity to continue.`
                : `"${product.name}" is currently unavailable. Please remove it from your cart.`
            );
          }
        }
        const hold = await tx.checkoutHold.create({
          data: {
            items: parsed.data.items.map((item) => ({ productId: bySlug.get(item.slug)!.id, qty: item.qty })),
            expiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
          },
          select: { id: true },
        });
        return hold.id;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message };
    // Serialization failure (Postgres error code 40001) — another
    // checkout for the same stock committed first. Not a tampering
    // attempt, just a genuine race; ask them to retry rather than
    // claiming a specific cause.
    return { error: "Something went wrong checking stock availability. Please try again." };
  }

  const stripe = getStripe();
  // Re-fetched server-side rather than trusting a client-submitted price —
  // same anti-tampering reasoning as the product price lookup above.
  const rates = await getShippingRates();
  const shippingPrice = getShippingPrice(rates, country, shippingSpeed);

  try {
    const session = await stripe.checkout.sessions.create({
      expires_at: Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60,
      mode: "payment",
      line_items: parsed.data.items.map((item) => {
        const product = bySlug.get(item.slug)!;
        return {
          quantity: item.qty,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(product.price * 100),
            product_data: { name: product.name, metadata: { slug: item.slug, sku: product.sku } },
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
                ? { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 2 } }
                : { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 7 } },
          },
        },
      ],
      metadata: {
        items: JSON.stringify(parsed.data.items),
        shippingSpeed,
        shippingCountry: country,
        ...(parsed.data.attribution ? { attribution: JSON.stringify(parsed.data.attribution) } : {}),
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    if (!session.url) {
      await prisma.checkoutHold.delete({ where: { id: holdId } }).catch(() => {});
      return { error: "Something went wrong starting checkout. Please try again." };
    }
    // The hold already reserved the stock the moment it was created above
    // — this just attaches the real session id so the webhook can find and
    // delete it once the Order row takes over as the reservation.
    await prisma.checkoutHold.update({ where: { id: holdId }, data: { stripeSessionId: session.id } });
    return { url: session.url };
  } catch {
    await prisma.checkoutHold.delete({ where: { id: holdId } }).catch(() => {});
    return { error: "Something went wrong starting checkout. Please try again." };
  }
}
