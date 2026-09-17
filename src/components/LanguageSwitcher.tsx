"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { localeNames, LOCALE_COOKIE, type Locale } from "@/lib/i18n-shared";
import { useTranslations } from "@/components/TranslationsProvider";

const allLocales: Locale[] = ["en", "es", "de", "fr", "it", "tr", "is"];

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
        className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
          dark ? "text-paper/70 hover:text-paper" : "text-ink/70 hover:text-ink"
        }`}
      >
        <Globe className="h-4 w-4" />
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
          <ul className="absolute right-0 top-full z-50 mt-2 w-40 rounded-[3px] border border-ink/10 bg-paper py-1.5 shadow-lg">
            {allLocales.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => choose(l)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-paper-dim ${
                    l === locale ? "text-gold-dark" : "text-ink"
                  }`}
                >
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
