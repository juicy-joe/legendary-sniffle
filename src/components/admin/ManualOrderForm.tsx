"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createManualOrder } from "@/app/admin/(dashboard)/orders/actions";
import { orderStatuses, type OrderStatusValue } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";

const statusLabels: Record<OrderStatusValue, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type ProductOption = { id: string; slug: string; name: string; price: number };
type LineItem = { slug: string; name: string; price: number; qty: number };

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

export default function ManualOrderForm({ products }: { products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState(createManualOrder, {});
  const [items, setItems] = useState<LineItem[]>([{ slug: "", name: "", price: 0, qty: 1 }]);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (field: string) => state.fieldErrors?.[field];

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { slug: "", name: "", price: 0, qty: 1 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function handlePickProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) updateItem(index, { slug: product.slug, name: product.name, price: product.price });
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("itemsJson", JSON.stringify(items.filter((i) => i.name.trim())));
        return formAction(formData);
      }}
      className="max-w-3xl space-y-8"
    >
      <div>
        <h2 className="mb-4 font-serif text-lg font-light text-ink">Customer</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Customer Name" name="customerName" error={err("customerName")}>
            <input id="customerName" name="customerName" className={inputClass} />
          </Field>
          <Field label="Email" name="email" error={err("email")}>
            <input id="email" name="email" type="email" className={inputClass} />
          </Field>
          <Field label="Address" name="address" error={err("address")}>
            <input id="address" name="address" className={inputClass} />
          </Field>
          <Field label="City" name="city" error={err("city")}>
            <input id="city" name="city" className={inputClass} />
          </Field>
          <Field label="Region / State" name="region" error={err("region")}>
            <input id="region" name="region" className={inputClass} />
          </Field>
          <Field label="Postal Code" name="postal" error={err("postal")}>
            <input id="postal" name="postal" className={inputClass} />
          </Field>
          <Field label="Country" name="country" error={err("country")}>
            <input id="country" name="country" placeholder="e.g. ES" className={inputClass} />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-lg font-light text-ink">Items</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-[3px] border border-ink/10 bg-paper-dim p-4 sm:grid-cols-[1fr_1fr_100px_80px_auto]">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-ink/50">Product (optional)</label>
                <select
                  className={inputClass}
                  defaultValue=""
                  onChange={(e) => e.target.value && handlePickProduct(i, e.target.value)}
                >
                  <option value="">Custom item&hellip;</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-ink/50">Name</label>
                <input
                  className={inputClass}
                  value={item.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-ink/50">Price (EUR)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className={inputClass}
                  value={item.price}
                  onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-ink/50">Qty</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputClass}
                  value={item.qty}
                  onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  aria-label="Remove item"
                  className="rounded-[3px] p-2.5 text-ink/40 hover:text-red-700 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-gold-dark hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-lg font-light text-ink">Totals</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Shipping Cost (EUR)" name="shippingCost" error={err("shippingCost")}>
            <input id="shippingCost" name="shippingCost" type="number" min={0} step={1} defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Tax Amount (EUR)" name="taxAmount" error={err("taxAmount")}>
            <input id="taxAmount" name="taxAmount" type="number" min={0} step={1} defaultValue={0} className={inputClass} />
          </Field>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          Subtotal: <span className="font-feature-tabular text-ink">{formatPrice(subtotal)}</span> (shipping and
          tax add to this once entered above)
        </p>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-lg font-light text-ink">Payment &amp; Status</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Payment Method" name="paymentMethod" error={err("paymentMethod")}>
            <input id="paymentMethod" name="paymentMethod" defaultValue="Bank Transfer" className={inputClass} />
          </Field>
          <Field label="Order Status" name="status" error={err("status")}>
            <select id="status" name="status" defaultValue="CONFIRMED" className={inputClass}>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </Field>
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
        className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Order & Send Confirmation"}
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
