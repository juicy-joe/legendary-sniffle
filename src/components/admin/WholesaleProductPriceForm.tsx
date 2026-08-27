"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { setWholesaleProductPrice, removeWholesaleProductPrice } from "@/app/admin/(dashboard)/wholesale/actions";

type Product = { id: string; name: string };
type Override = { id: string; productId: string; productName: string; price: number };

export default function WholesaleProductPriceForm({
  accountId,
  products,
  overrides,
}: {
  accountId: string;
  products: Product[];
  overrides: Override[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {overrides.length > 0 && (
        <ul className="mb-4 space-y-2">
          {overrides.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded-[3px] border border-ink/10 bg-paper-dim px-4 py-2.5 text-sm">
              <span className="text-ink">{o.productName}</span>
              <div className="flex items-center gap-3">
                <span className="font-feature-tabular text-ink/70">€{o.price}</span>
                <button
                  type="button"
                  onClick={() => startTransition(() => removeWholesaleProductPrice(o.id, accountId))}
                  aria-label={`Remove override for ${o.productName}`}
                  className="text-ink/40 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        action={(formData) =>
          startTransition(async () => {
            const result = await setWholesaleProductPrice(accountId, formData);
            setError(result.error ?? null);
          })
        }
        className="flex flex-wrap items-end gap-3"
      >
        <div>
          <label htmlFor="productId" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Product
          </label>
          <select
            id="productId"
            name="productId"
            defaultValue=""
            className="w-56 rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold-dark"
          >
            <option value="" disabled>
              Select&hellip;
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="price" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Price (EUR)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step={1}
            className="w-32 rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold-dark"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : "Set Price"}
        </button>
        {error && <p className="w-full text-xs text-red-700">{error}</p>}
      </form>
    </div>
  );
}
