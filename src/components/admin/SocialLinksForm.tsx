"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updateSocialLinks } from "@/app/admin/(dashboard)/social/actions";

type SocialData = { instagram: string; facebook: string; linkedin: string };

export default function SocialLinksForm({ links }: { links: SocialData }) {
  const [state, formAction, pending] = useActionState(updateSocialLinks, {});

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <Field label="Instagram" name="instagram" defaultValue={links.instagram} />
      <Field label="Facebook" name="facebook" defaultValue={links.facebook} />
      <Field label="LinkedIn" name="linkedin" defaultValue={links.linkedin} />

      <p className="text-xs text-ink/65">
        Leave a field blank to hide that icon in the site footer.
      </p>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Saved — live site-wide now.
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

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="url"
        placeholder="https://instagram.com/safalight"
        defaultValue={defaultValue === "#" ? "" : defaultValue}
        className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
      />
    </div>
  );
}
