"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, PackagePlus } from "lucide-react";
import { logStockMovement } from "@/app/admin/(dashboard)/warehouse/actions";

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

type ProductOption = { id: string; name: string };

export default function LogStockMovementForm({ products }: { products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState(logStockMovement, {});
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const formRef = useRef<HTMLFormElement>(null);
  const err = (field: string) => state.fieldErrors?.[field];

  // Clears the form after a successful log so the same panel is ready for
  // the next entry — this is a "log one, log another" tool, not a
  // single-use edit form. Depends on the `state` object itself (a new
  // reference every time the action resolves) rather than `state.success`
  // — two successes in a row both carry `success: true`, which wouldn't
  // re-trigger an effect keyed on that boolean alone.
  //
  // Only resets the uncontrolled fields (product/quantity/note/supplier/
  // cost, all plain `defaultValue`s) via the native form reset — the
  // Direction radio stays wherever it was left. That's deliberate, not an
  // oversight: setState inside an effect is what triggers the
  // cascading-render lint this project treats as an error, and leaving
  // Direction as-is is actually the better default anyway when logging
  // several movements of the same kind in a row.
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <details className="rounded-[6px] border border-ink/10 bg-paper" open>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-6 py-4 text-sm font-medium text-ink">
        <PackagePlus className="h-4 w-4" /> Log Stock Movement
      </summary>
      <form ref={formRef} action={formAction} className="space-y-4 border-t border-ink/10 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="productId" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Product
            </label>
            <select id="productId" name="productId" className={inputClass} defaultValue="">
              <option value="" disabled>
                Select a product&hellip;
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {err("productId") && <p className="mt-1 text-xs text-red-700">{err("productId")}</p>}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.15em] text-ink/65">Direction</p>
            <div className="flex gap-2">
              {(["IN", "OUT"] as const).map((t) => (
                <label
                  key={t}
                  className={`flex flex-1 cursor-pointer items-center justify-center rounded-[3px] border py-2.5 text-sm transition-colors ${
                    type === t ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="sr-only"
                  />
                  {t === "IN" ? "Incoming" : "Outgoing"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Quantity
            </label>
            <input id="quantity" name="quantity" type="number" min={1} step={1} className={inputClass} />
            {err("quantity") && <p className="mt-1 text-xs text-red-700">{err("quantity")}</p>}
          </div>

          <div>
            <label htmlFor="note" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Note
            </label>
            <input id="note" name="note" placeholder="e.g. Workshop batch #4" className={inputClass} />
          </div>

          {type === "IN" && (
            <>
              <div>
                <label htmlFor="supplier" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
                  Supplier <span className="normal-case text-ink/40">(optional)</span>
                </label>
                <input id="supplier" name="supplier" className={inputClass} />
              </div>
              <div>
                <label htmlFor="unitCost" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
                  Unit Cost (EUR) <span className="normal-case text-ink/40">(optional)</span>
                </label>
                <input id="unitCost" name="unitCost" type="number" min={0} step={1} className={inputClass} />
                {err("unitCost") && <p className="mt-1 text-xs text-red-700">{err("unitCost")}</p>}
              </div>
            </>
          )}
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Logged.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink bg-ink px-7 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
        >
          {pending ? "Logging..." : "Log Movement"}
        </button>
      </form>
    </details>
  );
}
