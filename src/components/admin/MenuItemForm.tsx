"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createMenuItem, updateMenuItem } from "@/app/admin/(dashboard)/menus/actions";

type MenuItemData = { id: string; label: string; href: string; location: string; sortOrder: number };

const locationOptions = [
  { value: "navbar", label: "Navbar" },
  { value: "footer-explore", label: "Footer — Explore" },
  { value: "footer-collections", label: "Footer — Collections" },
];

export default function MenuItemForm({
  mode,
  item,
  defaultLocation,
}: {
  mode: "create" | "edit";
  item?: MenuItemData;
  defaultLocation?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createMenuItem : updateMenuItem,
    {}
  );
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {mode === "edit" && <input type="hidden" name="id" value={item!.id} />}

      <Field label="Label" name="label" error={err("label")}>
        <input id="label" name="label" defaultValue={item?.label} className={inputClass} />
      </Field>

      <Field label="Link (path or URL)" name="href" error={err("href")}>
        <input
          id="href"
          name="href"
          placeholder="/products or https://..."
          defaultValue={item?.href}
          className={inputClass}
        />
      </Field>

      <Field label="Location" name="location" error={err("location")}>
        <select
          id="location"
          name="location"
          defaultValue={item?.location ?? defaultLocation ?? "navbar"}
          className={inputClass}
        >
          {locationOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sort Order (lower shows first)" name="sortOrder" error={err("sortOrder")}>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={item?.sortOrder ?? 0}
          className={inputClass}
        />
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
          {pending ? "Saving..." : mode === "create" ? "Create Link" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/menus")}
          className="text-sm text-ink/65 hover:text-ink"
        >
          Back to Menus
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
