"use client";

import { useActionState } from "react";
import { createCustomOrder } from "@/app/admin/(dashboard)/warehouse/custom-orders/actions";

type ProductOption = { id: string; name: string; sku: string };

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

export default function CustomOrderForm({ products }: { products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState(createCustomOrder, {});
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <Field label="Product" name="productId" error={err("productId")}>
        <select id="productId" name="productId" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a product&hellip;
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Quantity" name="quantity" error={err("quantity")}>
        <input id="quantity" name="quantity" type="number" min={1} step={1} defaultValue={1} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Customer Name" name="customerName" error={err("customerName")}>
          <input id="customerName" name="customerName" className={inputClass} />
        </Field>
        <Field label="Customer Email" name="customerEmail" error={err("customerEmail")}>
          <input id="customerEmail" name="customerEmail" type="email" className={inputClass} />
        </Field>
      </div>

      <Field label="Target Completion Date" name="targetCompletionDate" error={err("targetCompletionDate")}>
        <input id="targetCompletionDate" name="targetCompletionDate" type="date" className={inputClass} />
      </Field>

      <Field label="Notes" name="notes" error={err("notes")}>
        <textarea id="notes" name="notes" rows={4} className={inputClass} />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Custom Order"}
      </button>
    </form>
  );
}

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
