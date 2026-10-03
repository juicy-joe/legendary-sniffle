"use client";

// A single source of truth for the visitor's tracking consent choice,
// shared by the consent banner UI and every analytics/marketing call site.
// Two categories only — "necessary" (always on, nothing to consent to)
// and "analytics_marketing" (GA4 + any future ads pixel) — matching what
// this site actually has today rather than modelling categories (e.g. a
// separate ads-only toggle) nothing here uses yet.
export type ConsentChoice = "granted" | "denied";
export type ConsentState = { analytics: ConsentChoice; marketing: ConsentChoice };

const STORAGE_KEY = "ollerialight:consent";

export function getStoredConsent(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.analytics && parsed?.marketing) return parsed;
    return null;
  } catch {
    return null;
  }
}

function pushConsentUpdate(state: ConsentState) {
  window.dataLayer = window.dataLayer || [];
  // Google Consent Mode v2 signal names — gtag()/GTM both read these off
  // the dataLayer. ad_user_data/ad_personalization are tied to the same
  // "marketing" choice here since this site doesn't offer a finer-grained
  // split; analytics_storage tracks the "analytics" choice.
  window.dataLayer.push({
    event: "consent_update",
    analytics_storage: state.analytics,
    ad_storage: state.marketing,
    ad_user_data: state.marketing,
    ad_personalization: state.marketing,
  });
}

export function setConsent(state: ConsentState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Consent still applies for this page view even if it can't persist —
    // the banner will just reappear next visit.
  }
  pushConsentUpdate(state);
}

/** Call once, before any tag ever fires (see GtmLoader) — establishes the
 * "denied by default" baseline Consent Mode requires, so the very first
 * dataLayer events of a brand-new visit are never sent with implicit
 * consent they were never actually given. */
export function initializeConsentDefault() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "default_consent",
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    // EU/EEA/UK/CH is the only region that defaults to denied in most
    // Consent Mode setups, but this store currently has no geo-detection
    // to vary that — applying "denied by default" everywhere is the safe,
    // compliant choice until regional defaults are actually needed.
  });

  const stored = getStoredConsent();
  if (stored) pushConsentUpdate(stored);
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
