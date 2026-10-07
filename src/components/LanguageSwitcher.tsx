"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { localeNames, LOCALE_COOKIE, type Locale } from "@/lib/i18n-shared";
import { useTranslations } from "@/components/TranslationsProvider";
import FlagIcon from "@/components/FlagIcon";

// Scoped to the four languages the site is actually translated into —
// "fr"/"it"/"tr" exist in the shared Locale type for future use but have no
// translated content yet, so offering them here would just be a flag that
// silently does nothing.
const supportedLocales: Locale[] = ["en", "es", "de", "is"];

// Setting the cookie directly (not a server action) so the switch is
// instant and works from anywhere the component is mounted, then a router
// refresh re-runs every Server Component with the new locale already in
// place — same cookie proxy.ts itself sets on first visit, so a manual
// choice here persists exactly the way the auto-detected one does.
export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale } = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function choose(next: Locale) {
    // eslint-disable-next-line react-hooks/immutability -- document.cookie is a browser API setter, not React state
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setOpen(false);
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
          <ul className="absolute right-0 top-full z-50 mt-2 w-44 rounded-[3px] border border-ink/10 bg-paper py-1.5 shadow-lg">
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
