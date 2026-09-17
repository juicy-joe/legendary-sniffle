"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { saveUiTranslations } from "@/app/admin/(dashboard)/translations/actions";
import type { UiKeySection } from "@/lib/i18n-keys";
import type { Locale } from "@/lib/i18n-shared";

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

// One form covering every key across every section, so a single "Save
// Changes" persists the whole locale in one request — matches
// saveUiTranslations' expectation of key:<translationKey> fields.
export default function UiTranslationsEditor({
  locale,
  sections,
  values,
}: {
  locale: Locale;
  sections: UiKeySection[];
  values: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(saveUiTranslations, {});

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      {sections.map((section, i) => (
        <details key={section.section} open={i === 0} className="rounded-[6px] border border-ink/10 bg-paper">
          <summary className="cursor-pointer select-none px-5 py-4 font-serif text-lg font-light text-ink">
            {section.section}
            <span className="ml-2 text-xs font-sans text-ink/45">({section.keys.length})</span>
          </summary>
          <div className="space-y-5 border-t border-ink/10 px-5 py-5">
            {section.keys.map((entry) => (
              <div key={entry.key}>
                <label
                  htmlFor={entry.key}
                  className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-ink/55"
                >
                  {entry.key}
                </label>
                <p className="mb-1.5 text-xs italic text-ink/45">English: &ldquo;{entry.fallback}&rdquo;</p>
                {entry.fallback.length > 60 ? (
                  <textarea
                    id={entry.key}
                    name={`key:${entry.key}`}
                    rows={3}
                    defaultValue={values[entry.key] ?? ""}
                    placeholder={entry.fallback}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={entry.key}
                    name={`key:${entry.key}`}
                    defaultValue={values[entry.key] ?? ""}
                    placeholder={entry.fallback}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </details>
      ))}

      <div className="sticky bottom-0 flex items-center gap-4 rounded-[6px] border border-ink/10 bg-paper/95 p-4 backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink bg-ink px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.success && (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Saved.
          </p>
        )}
      </div>
    </form>
  );
}
