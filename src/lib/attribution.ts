"use client";

import { getStoredConsent } from "@/lib/analytics/consent";

// Captures marketing attribution on arrival (UTM params + Google's click
// IDs) and stores it in two cookies: first-touch is written once and never
// overwritten, last-touch is overwritten on every visit that carries
// campaign parameters. At checkout, both are read back and sent to
// createCheckoutSession, which stores them on the order via Stripe session
// metadata (see src/app/api/stripe/webhook/route.ts) — so a completed
// order can always answer "what actually brought this customer here" and
// "what brought them back to finish this particular purchase."
//
// These are marketing-attribution cookies (they can carry gclid/gbraid/
// wbraid), so they only get written once marketing consent is actually
// granted — never unconditionally on arrival. The catch: the UTM/gclid
// params are usually only present on the very first pageview (the ad
// click's landing URL), before the visitor has necessarily answered the
// consent banner yet, and gone from the URL on every page after that. So a
// touch computed before consent is granted is held in sessionStorage (tab-
// scoped, cleared on tab close, never sent anywhere) rather than discarded
// outright, and only gets promoted into the real persistent cookies via
// flushPendingAttribution(), which ConsentBanner calls the moment the
// visitor actually grants marketing consent.
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
const PENDING_TOUCH_KEY = "ollerialight:pending_touch";
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

function persistTouch(touch: Touch) {
  if (!getCookie(FIRST_TOUCH_COOKIE)) {
    setCookie(FIRST_TOUCH_COOKIE, JSON.stringify(touch));
  }
  setCookie(LAST_TOUCH_COOKIE, JSON.stringify(touch));
}

/** Call once per page load (see AttributionCapture component). */
export function captureAttribution() {
  const touch = buildTouch();
  if (!touch) return;

  if (getStoredConsent()?.marketing === "granted") {
    persistTouch(touch);
    return;
  }
  // Consent not yet granted — hold the touch in tab-scoped storage instead
  // of writing the real cookies. Overwrites any earlier pending touch this
  // same tab already captured, same "last one wins until persisted" logic
  // the real last-touch cookie uses.
  try {
    window.sessionStorage.setItem(PENDING_TOUCH_KEY, JSON.stringify(touch));
  } catch {
    // Storage unavailable (private mode, quota) — nothing to fall back to;
    // this visit's attribution is simply not captured.
  }
}

/** Called by ConsentBanner the moment marketing consent is granted —
 * promotes a touch captured earlier this tab (before consent existed) into
 * the real persistent cookies. A no-op if nothing was ever pending. */
export function flushPendingAttribution() {
  try {
    const raw = window.sessionStorage.getItem(PENDING_TOUCH_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(PENDING_TOUCH_KEY);
    persistTouch(JSON.parse(raw) as Touch);
  } catch {
    // Malformed or inaccessible — nothing worth persisting.
  }
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
