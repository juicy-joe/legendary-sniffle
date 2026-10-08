"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredConsent, setConsent } from "@/lib/analytics/consent";
import { flushPendingAttribution } from "@/lib/attribution";

// Deliberately minimal — a single quiet bar, not a modal or a full-screen
// takeover, and no "manage preferences" wizard for a site that only has
// one real choice to offer (analytics/marketing, on or off). Shown once
// per browser until a choice is made; never reappears after that.
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // getStoredConsent() reads localStorage, unavailable during the
    // server-rendered first pass — this has to be an effect, not a lazy
    // useState initializer, so the banner starts hidden on both server and
    // client and only appears once we actually know there's no stored
    // choice (avoiding a hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    setConsent({
      analytics: granted ? "granted" : "denied",
      marketing: granted ? "granted" : "denied",
    });
    if (granted) flushPendingAttribution();
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-ink/10 bg-paper/98 px-6 py-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur md:px-10"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/70">
          We use cookies to understand how the site is used and to improve it. Essential cookies
          are always on. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gold-dark">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-[3px] border border-ink/25 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-ink hover:text-ink"
          >
            Necessary Only
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
