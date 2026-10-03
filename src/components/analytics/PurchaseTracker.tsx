"use client";

import { useEffect } from "react";
import { trackPurchase, type GaItem } from "@/lib/analytics/gtm";
import { hashSha256 } from "@/lib/analytics/hash";
import { getStoredConsent } from "@/lib/analytics/consent";

type OrderItem = { sku?: string; name: string; price: number; qty: number };

export default function PurchaseTracker({
  orderNumber,
  email,
  total,
  shippingCost,
  taxAmount,
  items,
}: {
  orderNumber: string;
  email: string;
  total: number;
  shippingCost: number;
  taxAmount: number;
  items: OrderItem[];
}) {
  useEffect(() => {
    // Idempotency: the only thing stopping a confirmation-page refresh (or
    // the back/forward cache restoring this exact page) from firing a
    // second purchase event for the same order. This is a client-side
    // safeguard, not the authoritative one — the Order row itself can only
    // ever be created once (stripeSessionId is unique-constrained, see the
    // webhook) — but GA4 has no server-side view of that, so without this
    // a refresh here would double-count real revenue in every report.
    const dedupeKey = `ollerialight:purchase_tracked:${orderNumber}`;
    if (sessionStorage.getItem(dedupeKey)) return;

    const gaItems: GaItem[] = items
      .filter((item) => item.sku)
      .map((item) => ({
        item_id: item.sku!,
        item_name: item.name,
        item_brand: "Ollerialight",
        price: item.price,
        quantity: item.qty,
        currency: "EUR",
      }));

    async function fire() {
      const consent = getStoredConsent();
      let sha256Email: string | undefined;
      // Enhanced Conversions only ever sends a hashed value, and only once
      // the visitor has actually granted marketing consent — never as a
      // default/implicit behavior.
      if (consent?.marketing === "granted" && email) {
        sha256Email = await hashSha256(email);
      }

      trackPurchase({
        transactionId: orderNumber,
        value: total,
        shipping: shippingCost,
        tax: taxAmount,
        items: gaItems,
        userData: sha256Email ? { sha256Email } : undefined,
      });
      sessionStorage.setItem(dedupeKey, "1");
    }

    fire();
    // Runs once for this specific order, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return null;
}
