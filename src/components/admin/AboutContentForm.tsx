"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updateAboutContent } from "@/app/admin/(dashboard)/content/actions";

type AboutContentData = { heroHeadline: string; heroSubtext: string };

export default function AboutContentForm({ content }: { content: AboutContentData }) {
  const [state, formAction, pending] = useActionState(updateAboutContent, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Field label="Headline" name="heroHeadline" error={err("heroHeadline")}>
        <input id="heroHeadline" name="heroHeadline" defaultValue={content.heroHeadline} className={inputClass} />
      </Field>

      <Field label="Subtext" name="heroSubtext" error={err("heroSubtext")}>
        <textarea id="heroSubtext" name="heroSubtext" rows={3} defaultValue={content.heroSubtext} className={inputClass} />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Saved — live on the About page now.
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
