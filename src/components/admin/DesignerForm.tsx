"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createDesigner, updateDesigner } from "@/app/admin/(dashboard)/designers/actions";

type DesignerData = { id: string; name: string; origin: string; bio: string };

export default function DesignerForm({
  mode,
  designer,
}: {
  mode: "create" | "edit";
  designer?: DesignerData;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createDesigner : updateDesigner,
    {}
  );

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {mode === "edit" && <input type="hidden" name="id" value={designer!.id} />}

      <Field label="Name" name="name" error={err("name")}>
        <input id="name" name="name" defaultValue={designer?.name} className={inputClass} />
      </Field>

      <Field label="Origin" name="origin" error={err("origin")}>
        <input
          id="origin"
          name="origin"
          placeholder="Geneva, Switzerland"
          defaultValue={designer?.origin}
          className={inputClass}
        />
      </Field>

      <Field label="Bio" name="bio" error={err("bio")}>
        <textarea id="bio" name="bio" rows={4} defaultValue={designer?.bio} className={inputClass} />
      </Field>

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

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : mode === "create" ? "Create Designer" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/designers")}
          className="text-sm text-ink/65 hover:text-ink"
        >
          Back to Designers
        </button>
      </div>
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
