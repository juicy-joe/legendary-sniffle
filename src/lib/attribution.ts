"use client";

// Captures marketing attribution on arrival (UTM params + Google's click
// IDs) and stores it in two cookies: first-touch is written once and never
// overwritten, last-touch is overwritten on every visit that carries
// campaign parameters. At checkout, both are read back and sent to
// createCheckoutSession, which stores them on the order via Stripe session
// metadata (see src/app/api/stripe/webhook/route.ts) — so a completed
// order can always answer "what actually brought this customer here" and
// "what brought them back to finish this particular purchase."
export type Touch = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  landingPage: string;
  referrer: string;
  timestamp: string;
};

export type Attribution = { firstTouch?: Touch; lastTouch?: Touch };

const FIRST_TOUCH_COOKIE = "ollerialight:first_touch";
const LAST_TOUCH_COOKIE = "ollerialight:last_touch";
const MAX_AGE_DAYS = 180;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function buildTouch(): Touch | null {
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    content: params.get("utm_content") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    gbraid: params.get("gbraid") ?? undefined,
    wbraid: params.get("wbraid") ?? undefined,
    landingPage: window.location.pathname,
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
  };
  // No campaign signal at all (a plain direct visit or internal
  // navigation) isn't worth recording as a new "touch" — only a visit that
  // actually carries at least one of these parameters counts.
  const hasSignal = touch.source || touch.medium || touch.campaign || touch.gclid || touch.gbraid || touch.wbraid;
  return hasSignal ? touch : null;
}

/** Call once per page load (see AttributionCapture component). */
export function captureAttribution() {
  const touch = buildTouch();
  if (!touch) return;

  if (!getCookie(FIRST_TOUCH_COOKIE)) {
    setCookie(FIRST_TOUCH_COOKIE, JSON.stringify(touch));
  }
  setCookie(LAST_TOUCH_COOKIE, JSON.stringify(touch));
}

/** Read back at checkout time — never throws on malformed/missing cookies. */
export function getAttributionForCheckout(): Attribution {
  const parse = (raw: string | null): Touch | undefined => {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  };
  return {
    firstTouch: parse(getCookie(FIRST_TOUCH_COOKIE)),
    lastTouch: parse(getCookie(LAST_TOUCH_COOKIE)),
  };
}
