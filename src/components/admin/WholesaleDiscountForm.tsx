"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateWholesaleDiscount } from "@/app/admin/(dashboard)/wholesale/actions";

export default function WholesaleDiscountForm({
  accountId,
  initialValue,
  defaultDiscount,
}: {
  accountId: string;
  initialValue: number | null;
  defaultDiscount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          setSaved(false);
          const result = await updateWholesaleDiscount(accountId, formData);
          if (result.error) setError(result.error);
          else {
            setError(null);
            setSaved(true);
          }
        })
      }
      className="flex flex-wrap items-end gap-3"
    >
      <div>
        <label htmlFor="discountPercent" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Custom Discount (%)
        </label>
        <input
          id="discountPercent"
          name="discountPercent"
          type="number"
          min={0}
          max={100}
          step={1}
          defaultValue={initialValue ?? ""}
          placeholder={`Default: ${defaultDiscount}`}
          className="w-40 rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {saved && (
        <span className="flex items-center gap-1 text-xs text-emerald-700">
          <Check className="h-3.5 w-3.5" /> Saved
        </span>
      )}
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
      <p className="w-full text-xs text-ink/50">Leave blank to use the site-wide default ({defaultDiscount}%).</p>
    </form>
  );
}
