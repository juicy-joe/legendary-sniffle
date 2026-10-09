// Locale constants + pure helpers shared by server code (src/lib/i18n.ts,
// proxy.ts) AND client components (LanguageSwitcher, TranslationsProvider).
// Deliberately has zero imports of its own — no "server-only", no prisma —
// so pulling it into a client bundle never drags in the Postgres driver the
// way importing i18n.ts directly would.
export const locales = ["es", "de", "fr", "it", "tr", "is"] as const;
export type Locale = (typeof locales)[number] | "en";
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  tr: "Türkçe",
  is: "Íslenska",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";

// Request header proxy.ts attaches (alongside rewriting the URL) so the
// rendered page can read back exactly which locale prefix the incoming
// request matched, within the same request — see getLocale() in
// src/lib/i18n.ts for why this is preferred over the cookie.
export const LOCALE_HEADER = "x-locale";

export function isLocale(value: string): value is Locale {
  return value === "en" || (locales as readonly string[]).includes(value);
}

/** Picks the best supported locale from an Accept-Language header, e.g.
 * "de-DE,de;q=0.9,en;q=0.8" -> "de". Falls back to English when nothing in
 * the header matches a supported locale. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .map((tag) => tag.split("-")[0]);
  for (const tag of candidates) {
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

// ISO 3166-1 alpha-2 country -> site locale. Deliberately only the three
// countries the site has a real reason to target by geography (Spain,
// Germany, Iceland) — every other country, including English-speaking ones
// and any EU country without its own translation, maps to English. This is
// intentionally a stricter, narrower map than "which countries speak
// Spanish/German" (e.g. Austria/Switzerland aren't included) — the ask was
// specifically Spain/Germany/Iceland by IP, everyone else English.
const countryToLocale: Record<string, Locale> = {
  ES: "es",
  DE: "de",
  IS: "is",
};

/** Picks a locale from a visitor's country (Vercel's `x-vercel-ip-country`
 * request header — free, no third-party geo-IP lookup needed). Returns
 * null for a country with no dedicated locale (or when the header is
 * absent, e.g. local dev / non-Vercel hosting) so the caller can fall back
 * to Accept-Language instead of forcing English over a real signal. */
export function localeFromCountry(countryCode: string | null): Locale | null {
  if (!countryCode) return null;
  return countryToLocale[countryCode.toUpperCase()] ?? null;
}

// The locales that actually get their own URL prefix (/en/, /es/, /de/,
// /is/) — the same four LanguageSwitcher offers. "fr"/"it"/"tr" stay valid
// Locale values (translation data could exist for them some day) but have
// no routable prefix yet, so they're deliberately excluded here rather than
// derived from `locales`.
export const routableLocales: Locale[] = ["en", "es", "de", "is"];

export function isRoutableLocale(value: string): value is Locale {
  return (routableLocales as string[]).includes(value);
}

/** Prefixes an internal, site-relative href with a locale segment, e.g.
 * localizedHref("es", "/table-lamps") -> "/es/table-lamps". Anything that
 * isn't an internal absolute path — external URLs, protocol-relative
 * "//...", mailto:/tel:, hash-only "#..." anchors — is returned unchanged,
 * since those were never meant to carry a locale prefix. Used by
 * src/components/Link.tsx so every internal <Link> in the app gets the
 * current locale's URL for free, without each call site doing it by hand. */
export function localizedHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Strips a routable locale prefix off a pathname, e.g. "/es/table-lamps"
 * -> "/table-lamps", "/en" -> "/". A pathname with no locale prefix is
 * returned unchanged. Used both by proxy.ts (to recover the real route
 * after reading the prefix) and by the language switcher (to rebuild the
 * current path under a different locale). */
export function stripLocalePrefix(pathname: string): { locale: Locale | null; rest: string } {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (match && isRoutableLocale(match[1])) {
    return { locale: match[1], rest: match[2] || "/" };
  }
  return { locale: null, rest: pathname };
}
