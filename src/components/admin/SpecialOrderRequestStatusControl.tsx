"use client";

import { useTransition } from "react";
import { updateSpecialOrderRequestStatus } from "@/app/admin/(dashboard)/wholesale/requests/actions";

const statuses = [
  { value: "NEW", label: "New" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "RESPONDED", label: "Responded" },
  { value: "CLOSED", label: "Closed" },
];

export default function SpecialOrderRequestStatusControl({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateSpecialOrderRequestStatus(id, e.target.value))}
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
