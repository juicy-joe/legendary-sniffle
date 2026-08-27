"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { approveWholesaleAccount, rejectWholesaleAccount } from "@/app/admin/(dashboard)/wholesale/actions";

export default function WholesaleApplicationActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await approveWholesaleAccount(id);
              if (result?.error) setError(result.error);
            })
          }
          className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => rejectWholesaleAccount(id))}
          className="flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-red-700 disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      </div>
      {error && <p className="max-w-[220px] text-right text-[11px] text-red-700">{error}</p>}
    </div>
  );
}
