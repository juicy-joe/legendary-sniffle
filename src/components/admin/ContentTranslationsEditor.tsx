"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { saveContentTranslationsBulk } from "@/app/admin/(dashboard)/translations/actions";
import type { Locale } from "@/lib/i18n-shared";

export type ContentField = {
  model: string;
  recordId: string;
  field: string;
  label: string;
  english: string;
  value: string;
  multiline?: boolean;
};

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

// Mirrors UiTranslationsEditor's shape but for database-backed content
// fields (product descriptions, designer bios, etc.) — one bulk form per
// section, submitted via saveContentTranslationsBulk. `collapsible` wraps
// the whole section in a closed <details> (long lists like Products), and
// `groupEvery` inserts a divider every N fields so a product's
// description/story/materials trio stays visually together.
export default function ContentTranslationsEditor({
  locale,
  heading,
  fields,
  collapsible = false,
  groupEvery,
}: {
  locale: Locale;
  heading: string;
  fields: ContentField[];
  collapsible?: boolean;
  groupEvery?: number;
}) {
  const [state, formAction, pending] = useActionState(saveContentTranslationsBulk, {});

  if (fields.length === 0) return null;

  const body = (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-5">
        {fields.map((f, i) => (
          <div
            key={`${f.model}:${f.recordId}:${f.field}`}
            className={groupEvery && i > 0 && i % groupEvery === 0 ? "border-t border-ink/10 pt-5" : undefined}
          >
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-ink/55">{f.label}</label>
            <p className="mb-1.5 line-clamp-2 text-xs italic text-ink/45">English: &ldquo;{f.english}&rdquo;</p>
            {f.multiline ? (
              <textarea
                name={`field:${f.model}|${f.recordId}|${f.field}`}
                rows={3}
                defaultValue={f.value}
                placeholder={f.english}
                className={inputClass}
              />
            ) : (
              <input
                name={`field:${f.model}|${f.recordId}|${f.field}`}
                defaultValue={f.value}
                placeholder={f.english}
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink bg-ink px-7 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : `Save ${heading}`}
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

  if (!collapsible) {
    return (
      <section>
        <h2 className="mb-4 font-serif text-xl font-light text-ink">{heading}</h2>
        {body}
      </section>
    );
  }

  return (
    <details className="rounded-[6px] border border-ink/10 bg-paper">
      <summary className="cursor-pointer select-none px-5 py-4 font-serif text-xl font-light text-ink">
        {heading} <span className="ml-2 text-xs font-sans text-ink/45">({fields.length} fields)</span>
      </summary>
      <div className="border-t border-ink/10 p-5">{body}</div>
    </details>
  );
}
