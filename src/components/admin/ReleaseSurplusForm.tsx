"use client";

import { useActionState } from "react";
import { PackagePlus } from "lucide-react";
import { releaseSurplusToStock } from "@/app/admin/(dashboard)/warehouse/custom-orders/actions";

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

export default function ReleaseSurplusForm({ customOrderId }: { customOrderId: string }) {
  const [state, formAction, pending] = useActionState(releaseSurplusToStock, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="customOrderId" value={customOrderId} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
        <div>
          <label htmlFor="quantity" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Quantity
          </label>
          <input id="quantity" name="quantity" type="number" min={1} step={1} className={inputClass} />
        </div>
        <div>
          <label htmlFor="note" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Note <span className="normal-case text-ink/40">(optional)</span>
          </label>
          <input id="note" name="note" placeholder="Surplus released from custom order" className={inputClass} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        <PackagePlus className="h-4 w-4" /> {pending ? "Releasing..." : "Release to Retail Stock"}
      </button>
    </form>
  );
}
