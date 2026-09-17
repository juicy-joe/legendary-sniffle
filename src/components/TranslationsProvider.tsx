"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n-shared";

type Ctx = { locale: Locale; dict: Record<string, string> };

const TranslationsContext = createContext<Ctx>({ locale: "en", dict: {} });

/** Wraps the app once, near the root layout, with the current locale's
 * translation dictionary already resolved server-side (see
 * getUiTranslations in src/lib/i18n.ts) — client components read it via
 * useTranslations() below instead of each fetching their own. */
export default function TranslationsProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Record<string, string>;
  children: React.ReactNode;
}) {
  return <TranslationsContext.Provider value={{ locale, dict }}>{children}</TranslationsContext.Provider>;
}

/** Client-component equivalent of t() from src/lib/i18n.ts — same
 * fallback contract: `tt("cart.addToOrder", "Add to Order")` returns the
 * translated string for the current locale, or the English fallback
 * argument when untranslated (or when the locale is English itself). */
export function useTranslations() {
  const { locale, dict } = useContext(TranslationsContext);
  const tt = (key: string, fallback: string) => dict[key] ?? fallback;
  return { locale, t: tt };
}
