"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getStoredConsent } from "@/lib/analytics/consent";

// Fires one first-party page-view beacon per client-side navigation. Reads
// window.location.search directly (rather than useSearchParams) so this
// component never needs a Suspense boundary — same reasoning as
// AttributionCapture, which reads window.location the same way. Gated behind
// the same "analytics" consent category GTM/GA4 use — no page view is ever
// recorded before the visitor has actually granted analytics consent.
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (getStoredConsent()?.analytics !== "granted") return;

    const path = `${pathname}${window.location.search}`;
    const payload = JSON.stringify({ path, referrer: document.referrer || null });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track/pageview", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track/pageview", { method: "POST", body: payload, keepalive: true });
    }
  }, [pathname]);

  return null;
}
