"use client";

import { useTransition } from "react";
import { updateCustomOrderStatus } from "@/app/admin/(dashboard)/warehouse/custom-orders/actions";

const statuses = [
  { value: "QUOTED", label: "Quoted" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function CustomOrderStatusControl({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateCustomOrderStatus(id, e.target.value))}
      className="rounded-[3px] border border-ink/20 bg-transparent px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-ink outline-none focus:border-gold-dark disabled:opacity-60"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
