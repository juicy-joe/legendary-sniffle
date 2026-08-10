"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { updateSettings } from "@/app/admin/(dashboard)/settings/actions";

type SettingsData = {
  siteName: string;
  siteUrl: string;
  defaultMetaTitle: string;
  defaultMetaDesc: string;
};

export default function SettingsForm({ settings }: { settings: SettingsData }) {
  const [state, formAction, pending] = useActionState(updateSettings, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <Field label="Site Name" name="siteName" error={err("siteName")}>
        <input id="siteName" name="siteName" defaultValue={settings.siteName} className={inputClass} />
      </Field>

      <div>
        <Field label="Site URL" name="siteUrl" error={err("siteUrl")}>
          <input id="siteUrl" name="siteUrl" defaultValue={settings.siteUrl} className={inputClass} />
        </Field>
        <p className="mt-1.5 text-xs text-ink/60">
          Recorded for reference only. The live site&rsquo;s actual domain is
          controlled by your Vercel project and the{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5">NEXT_PUBLIC_SITE_URL</code>{" "}
          environment variable — update those to really change it.
        </p>
      </div>

      <Field label="Default Meta Title" name="defaultMetaTitle" error={err("defaultMetaTitle")}>
        <input id="defaultMetaTitle" name="defaultMetaTitle" defaultValue={settings.defaultMetaTitle} className={inputClass} />
      </Field>

      <div>
        <Field label="Default Meta Description" name="defaultMetaDesc" error={err("defaultMetaDesc")}>
          <textarea
            id="defaultMetaDesc"
            name="defaultMetaDesc"
            rows={3}
            defaultValue={settings.defaultMetaDesc}
            className={inputClass}
          />
        </Field>
        <p className="mt-1.5 text-xs text-ink/60">
          Used as the homepage&rsquo;s title/description and as the fallback
          for any page that doesn&rsquo;t set its own.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Saved.
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
