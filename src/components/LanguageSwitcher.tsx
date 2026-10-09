"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { localeNames, stripLocalePrefix, type Locale } from "@/lib/i18n-shared";
import { useTranslations } from "@/components/TranslationsProvider";
import FlagIcon from "@/components/FlagIcon";

// Scoped to the four languages the site is actually translated into —
// "fr"/"it"/"tr" exist in the shared Locale type for future use but have no
// translated content yet, so offering them here would just be a flag that
// silently does nothing.
const supportedLocales: Locale[] = ["en", "es", "de", "is"];

// Navigates to the SAME page under a different locale prefix — e.g.
// switching from /de/products/foo lands on /es/products/foo, never the
// homepage. usePathname() already gives back the real (prefixed) URL
// here (unlike a Server Component, which only ever sees the
// post-middleware-rewrite unprefixed path), so stripping the current
// prefix and adding the new one is all this needs; proxy.ts's rewrite
// then takes over on the next request exactly like any other locale URL.
// Deliberately a real navigation (not just setting the cookie and
// refreshing) — the master spec requires the URL itself to reflect the
// chosen language, not just a cookie, for hreflang/canonical/Ads
// landing-page correctness.
export default function LanguageSwitcher({ dark = false, dropUp = false }: { dark?: boolean; dropUp?: boolean }) {
  const { locale } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function choose(next: Locale) {
    setOpen(false);
    const { rest } = stripLocalePrefix(pathname);
    // Next.js's client router treats this as a navigation within the same
    // route segment — from its point of view /en/table-lamps and
    // /is/table-lamps both resolve to the identical (site) layout +
    // table-lamps page, since the locale prefix only exists via proxy.ts's
    // rewrite and was never part of the actual route tree. That means
    // push() alone can leave the ROOT LAYOUT (and everything it set up —
    // <html lang>, TranslationsProvider's locale/dict, every <Link>'s
    // locale-prefixing) stale, still reflecting the locale the page was
    // first loaded with. refresh() busts that cache and forces a genuine
    // re-render of the whole tree against the new URL, same as it always
    // has for any other post-navigation data change.
    router.push(rest === "/" ? `/${next}` : `/${next}${rest}`);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose language"
        aria-expanded={open}
        className={`flex items-center gap-2 text-xs uppercase tracking-[0.1em] transition-colors ${
          dark ? "text-paper/70 hover:text-paper" : "text-ink/70 hover:text-ink"
        }`}
      >
        <FlagIcon locale={locale} />
        {locale}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close language menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            className={`absolute right-0 z-50 w-44 rounded-[3px] border border-ink/10 bg-paper py-1.5 shadow-lg ${
              dropUp ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {supportedLocales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => choose(l)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-paper-dim ${
                    l === locale ? "text-gold-dark" : "text-ink"
                  }`}
                >
                  <FlagIcon locale={l} />
                  {localeNames[l]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
