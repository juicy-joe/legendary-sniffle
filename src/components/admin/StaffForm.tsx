"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createStaff, updateStaff } from "@/app/admin/(dashboard)/staff/actions";

type StaffData = { id: string; name: string; email: string; role: "OWNER" | "EDITOR" };

export default function StaffForm({
  mode,
  staff,
}: {
  mode: "create" | "edit";
  staff?: StaffData;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createStaff : updateStaff,
    {}
  );
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {mode === "edit" && <input type="hidden" name="id" value={staff!.id} />}

      <Field label="Name" name="name" error={err("name")}>
        <input id="name" name="name" defaultValue={staff?.name} className={inputClass} />
      </Field>

      <Field label="Email" name="email" error={err("email")}>
        <input id="email" name="email" type="email" defaultValue={staff?.email} className={inputClass} />
      </Field>

      <Field
        label={mode === "create" ? "Password" : "New Password (leave blank to keep current)"}
        name="password"
        error={err("password")}
      >
        <input id="password" name="password" type="password" autoComplete="new-password" className={inputClass} />
      </Field>

      <Field label="Role" name="role" error={err("role")}>
        <select id="role" name="role" defaultValue={staff?.role ?? "EDITOR"} className={inputClass}>
          <option value="EDITOR">Editor — manages content, no staff access</option>
          <option value="OWNER">Owner — full access, including staff accounts</option>
        </select>
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
          {pending ? "Saving..." : mode === "create" ? "Create Account" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/staff")}
          className="text-sm text-ink/65 hover:text-ink"
        >
          Back to Staff
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
