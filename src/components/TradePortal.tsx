"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import {
  SHIPPABLE_COUNTRIES,
  getShippingPrice,
  type ShippingRates,
  type ShippingSpeed,
} from "@/lib/shipping";
import { createWholesaleCheckoutSession } from "@/app/(site)/trade/portal/actions";

type Item = {
  id: string;
  slug: string;
  name: string;
  retailPrice: number;
  wholesalePrice: number;
  image: { url: string; label: string } | null;
};

type CartLine = { slug: string; qty: number };

const STORAGE_KEY = "safalight:trade-cart";
const sortedCountries = [...SHIPPABLE_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

// Deliberately its own self-contained cart, not the storefront's CartContext
// — that context's subtotal is computed from retail prices everywhere else
// it's used (the cart drawer, the regular checkout page), and there's no
// clean way to make it wholesale-aware without either duplicating that
// price logic on the client (risking it drifting from what checkout
// actually charges) or making the whole public catalog dynamic per-viewer
// just to support this one portal. A local cart scoped to this page avoids
// both, at the cost of a wholesale order and a retail order not being able
// to share one cart — an acceptable trade for two genuinely different
// buying flows.
export default function TradePortal({
  items,
  shippingRates,
}: {
  items: Item[];
  shippingRates: ShippingRates;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [country, setCountry] = useState("");
  const [shippingSpeed, setShippingSpeed] = useState<ShippingSpeed>("regular");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: CartLine[]) => {
    setCart(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const itemBySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);

  const addToCart = (slug: string) => {
    const existing = cart.find((l) => l.slug === slug);
    persist(
      existing
        ? cart.map((l) => (l.slug === slug ? { ...l, qty: l.qty + 1 } : l))
        : [...cart, { slug, qty: 1 }]
    );
  };

  const setQty = (slug: string, qty: number) => {
    if (qty < 1) {
      persist(cart.filter((l) => l.slug !== slug));
      return;
    }
    persist(cart.map((l) => (l.slug === slug ? { ...l, qty } : l)));
  };

  const cartLines = cart
    .map((l) => ({ line: l, item: itemBySlug.get(l.slug) }))
    .filter((x): x is { line: CartLine; item: Item } => !!x.item);

  const subtotal = cartLines.reduce((sum, { line, item }) => sum + item.wholesalePrice * line.qty, 0);
  const shippingCost = country ? getShippingPrice(shippingRates, country, shippingSpeed) : null;

  const handleCheckout = async () => {
    if (cartLines.length === 0) return;
    if (!country) {
      setError("Please select a shipping country before continuing.");
      return;
    }
    setStarting(true);
    setError("");
    const result = await createWholesaleCheckoutSession({
      items: cart,
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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-[6px] border border-ink/10 bg-paper"
          >
            <div className="relative aspect-square bg-paper-dim">
              {item.image && (
                <Image
                  src={item.image.url}
                  alt={item.image.label || item.name}
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-serif text-lg text-ink">{item.name}</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-feature-tabular text-ink">{formatPrice(item.wholesalePrice)}</span>
                {item.wholesalePrice !== item.retailPrice && (
                  <span className="font-feature-tabular text-xs text-ink/40 line-through">
                    {formatPrice(item.retailPrice)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => addToCart(item.slug)}
                className="mt-3 rounded-[3px] border border-ink px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-[6px] border border-ink/10 bg-paper-dim p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-light text-ink">
          <ShoppingBag className="h-4 w-4" /> Your Order
        </h2>

        {cartLines.length === 0 ? (
          <p className="text-sm text-ink/60">No items yet — add pieces from the catalog.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {cartLines.map(({ line, item }) => (
                <li key={line.slug} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex-1 text-ink/80">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.qty - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-[3px] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-feature-tabular">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.qty + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-[3px] border border-ink/20 text-ink/60 hover:border-ink hover:text-ink"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="w-16 text-right font-feature-tabular text-ink/70">
                    {formatPrice(item.wholesalePrice * line.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-3 border-t border-ink/10 pt-4">
              <div>
                <label htmlFor="trade-country" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
                  Country
                </label>
                <select
                  id="trade-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-[3px] border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold-dark"
                >
                  <option value="">Select&hellip;</option>
                  {sortedCountries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {(["regular", "express"] as const).map((speed) => (
                  <label
                    key={speed}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-[3px] border py-2 text-xs transition-colors ${
                      shippingSpeed === speed ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/70"
                    }`}
                  >
                    <input
                      type="radio"
                      name="trade-shipping-speed"
                      value={speed}
                      checked={shippingSpeed === speed}
                      onChange={() => setShippingSpeed(speed)}
                      className="sr-only"
                    />
                    {speed === "express" ? "Express" : "Regular"}
                  </label>
                ))}
              </div>

              <div className="space-y-1.5 pt-1 text-sm">
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal</span>
                  <span className="font-feature-tabular">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span>Shipping</span>
                  <span className="font-feature-tabular">
                    {shippingCost === null ? "—" : shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </div>
                <p className="text-xs text-ink/50">Tax is calculated on Stripe&rsquo;s checkout page.</p>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={starting}
              className="mt-4 w-full rounded-[3px] border border-ink bg-ink px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
            >
              {starting ? "Redirecting..." : "Continue to Payment"}
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
