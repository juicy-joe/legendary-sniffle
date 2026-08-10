"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { markEnquiryStatus } from "@/app/admin/(dashboard)/enquiries/actions";

const statuses = ["NEW", "READ", "REPLIED"] as const;

export default function EnquiryStatusControl({
  id,
  status,
}: {
  id: string;
  status: "NEW" | "READ" | "REPLIED";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending || s === status}
          onClick={() => startTransition(() => markEnquiryStatus(id, s))}
          className={clsx(
            "rounded-[3px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors duration-300 disabled:cursor-default",
            s === status
              ? "border-gold-dark bg-gold-dark/10 text-gold-dark"
              : "border-ink/20 text-ink/60 hover:border-ink"
          )}
        >
          {s === "NEW" ? "New" : s === "READ" ? "Mark as Read" : "Mark as Replied"}
        </button>
      ))}
    </div>
  );
}
