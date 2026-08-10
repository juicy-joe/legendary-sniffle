"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updateHomeContent } from "@/app/admin/(dashboard)/content/actions";

type HomeContentData = {
  heroEyebrow: string;
  heroHeadline: string;
  heroHeadlineAccent: string;
  heroSubtext: string;
  chromaHeadline: string;
  chromaSubtext: string;
  craftHeadline: string;
  craftSubtext: string;
};

export default function HomeContentForm({ content }: { content: HomeContentData }) {
  const [state, formAction, pending] = useActionState(updateHomeContent, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">Hero</h2>

        <Field label="Eyebrow (small badge above the headline)" name="heroEyebrow" error={err("heroEyebrow")}>
          <input id="heroEyebrow" name="heroEyebrow" defaultValue={content.heroEyebrow} className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Headline" name="heroHeadline" error={err("heroHeadline")}>
            <input id="heroHeadline" name="heroHeadline" defaultValue={content.heroHeadline} className={inputClass} />
          </Field>
          <Field
            label="Headline accent (styled in gold italic)"
            name="heroHeadlineAccent"
            error={err("heroHeadlineAccent")}
          >
            <input
              id="heroHeadlineAccent"
              name="heroHeadlineAccent"
              defaultValue={content.heroHeadlineAccent}
              className={inputClass}
            />
          </Field>
        </div>
        <p className="-mt-4 text-xs text-ink/65">
          Renders as: &ldquo;{content.heroHeadline} <em>{content.heroHeadlineAccent}</em>.&rdquo;
        </p>

        <Field label="Subtext" name="heroSubtext" error={err("heroSubtext")}>
          <textarea id="heroSubtext" name="heroSubtext" rows={3} defaultValue={content.heroSubtext} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">Chroma Editions Section</h2>

        <Field label="Headline" name="chromaHeadline" error={err("chromaHeadline")}>
          <input id="chromaHeadline" name="chromaHeadline" defaultValue={content.chromaHeadline} className={inputClass} />
        </Field>

        <Field label="Subtext" name="chromaSubtext" error={err("chromaSubtext")}>
          <textarea
            id="chromaSubtext"
            name="chromaSubtext"
            rows={3}
            defaultValue={content.chromaSubtext}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">Craft Section</h2>

        <Field label="Headline" name="craftHeadline" error={err("craftHeadline")}>
          <input id="craftHeadline" name="craftHeadline" defaultValue={content.craftHeadline} className={inputClass} />
        </Field>

        <Field label="Subtext" name="craftSubtext" error={err("craftSubtext")}>
          <textarea
            id="craftSubtext"
            name="craftSubtext"
            rows={3}
            defaultValue={content.craftSubtext}
            className={inputClass}
          />
        </Field>
      </section>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Saved — live on the homepage now.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
