"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";
import { orderStatuses, type OrderStatusValue } from "@/lib/order-status";

const labels: Record<OrderStatusValue, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function OrderStatusControl({ id, status }: { id: string; status: OrderStatusValue }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateOrderStatus(id, e.target.value as OrderStatusValue))}
      className="rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] text-ink outline-none focus:border-gold-dark disabled:opacity-60"
    >
      {orderStatuses.map((s) => (
        <option key={s} value={s}>
          {labels[s]}
        </option>
      ))}
    </select>
  );
}
