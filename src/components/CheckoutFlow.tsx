"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { createCheckoutSession } from "@/app/(site)/checkout/actions";
import { formatPrice } from "@/lib/format";
import {
  SHIPPABLE_COUNTRIES,
  getShippingPrice,
  type ShippingRates,
  type ShippingSpeed,
} from "@/lib/shipping";
import LampIllustration from "./LampIllustration";
import ProductPhoto from "./ProductPhoto";

const sortedCountries = [...SHIPPABLE_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

// Deliberately just a cart review + destination/speed picker + one button
// now — the multi-step address form this used to be is gone because
// Stripe Checkout's own hosted page collects the rest of the address and
// takes payment itself. The country and shipping speed are decided here,
// before Stripe is ever involved, because Stripe Checkout has no way to
// show/hide a shipping option based on the address someone types into its
// own page — the destination has to be known upfront so the right single
// price (free within the EU, a flat rate otherwise) can be charged.
export default function CheckoutFlow({ rates }: { rates: ShippingRates }) {
  const { lines, subtotal } = useCart();
  const { getProduct } = useCatalog();
  const [country, setCountry] = useState("");
  const [shippingSpeed, setShippingSpeed] = useState<ShippingSpeed>("regular");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const lineItems = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, product: getProduct(l.slug) }))
        .filter((x) => x.product),
    [lines, getProduct]
  );

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-ink/20" strokeWidth={1} />
        <p className="text-ink/60">Your cart is empty.</p>
        <Link
          href="/products"
          className="rounded-[3px] bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-dark"
        >
          Browse the Collection
        </Link>
      </div>
    );
  }

  const shippingCost = country ? getShippingPrice(rates, country, shippingSpeed) : null;

  const handleContinue = async () => {
    if (!country) {
      setError("Please select your country before continuing.");
      return;
    }
    setStarting(true);
    setError("");
    const result = await createCheckoutSession({
      items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
      country,
      shippingSpeed,
    });
    if ("error" in result) {
      setStarting(false);
      setError(result.error);
      return;
    }
    window.location.href = result.url;
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[6px] border border-ink/10 bg-paper-dim p-6">
        <h2 className="mb-5 font-serif text-xl font-light text-ink">
          Order Summary
        </h2>
        <ul className="space-y-4">
          {lineItems.map(({ line, product }) => (
            <li key={line.slug} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] border border-ink/10 bg-paper">
                {product!.images?.length ? (
                  <ProductPhoto images={product!.images} alt={product!.name} showSelector={false} />
                ) : (
                  <div className="p-2">
                    <LampIllustration product={product!} animated={false} className="h-full w-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink">{product!.name}</p>
                <p className="text-xs text-ink/65">Qty {line.qty}</p>
              </div>
              <p className="text-sm text-ink/70 font-feature-tabular">
                {formatPrice(product!.price * line.qty)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span className="font-feature-tabular">{formatPrice(subtotal)}</span>
          </div>
          {shippingCost !== null && (
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span className="font-feature-tabular">
                {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
              </span>
            </div>
          )}
          <p className="text-xs text-ink/50">Tax is calculated on the next step, based on your delivery address.</p>
        </div>
      </div>

      <div className="mt-6 space-y-5 rounded-[6px] border border-ink/10 bg-paper-dim p-6">
        <div>
          <label htmlFor="checkout-country" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Country
          </label>
          <select
            id="checkout-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-[3px] border border-ink/20 bg-paper px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Select your country&hellip;</option>
            {sortedCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Shipping Speed</p>
          <div className="space-y-2">
            {(["regular", "express"] as const).map((speed) => {
              const price = country ? getShippingPrice(rates, country, speed) : null;
              return (
                <label
                  key={speed}
                  className={`flex cursor-pointer items-center justify-between rounded-[3px] border px-3.5 py-3 text-sm transition-colors ${
                    shippingSpeed === speed ? "border-ink bg-paper" : "border-ink/15 bg-paper/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping-speed"
                      value={speed}
                      checked={shippingSpeed === speed}
                      onChange={() => setShippingSpeed(speed)}
                      className="accent-ink"
                    />
                    <span className="text-ink">{speed === "express" ? "Express Shipping" : "Regular Shipping"}</span>
                  </span>
                  <span className="text-ink/60 font-feature-tabular">
                    {price === null ? "—" : price === 0 ? "Free" : formatPrice(price)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={starting}
        className="mt-6 w-full rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {starting ? "Redirecting to Payment..." : "Continue to Payment"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/50">
        You&rsquo;ll enter your full address and pay securely on Stripe&rsquo;s checkout page.
      </p>
    </div>
  );
}
