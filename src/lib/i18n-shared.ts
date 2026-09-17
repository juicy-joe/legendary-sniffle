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
