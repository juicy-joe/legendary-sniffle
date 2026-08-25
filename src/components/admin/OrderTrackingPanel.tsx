"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Truck } from "lucide-react";
import { markOrderShipped, resendShippedEmail } from "@/app/admin/(dashboard)/orders/actions";

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

type Order = {
  id: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedEmailSentAt: Date | null;
};

export default function OrderTrackingPanel({ order }: { order: Order }) {
  const [state, formAction, pending] = useActionState(markOrderShipped, {});
  const [editing, setEditing] = useState(!order.trackingNumber);
  const err = (field: string) => state.fieldErrors?.[field];

  const alreadyShipped = !!order.shippedEmailSentAt && !editing;

  if (alreadyShipped) {
    return (
      <div className="mt-8 border-t border-ink/10 pt-6">
        <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Shipping &amp; Tracking</p>
        <div className="flex items-start justify-between gap-4 rounded-[6px] border border-ink/10 bg-paper-dim p-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-ink">
              <Check className="h-3.5 w-3.5 text-emerald-700" /> Customer notified
              {order.shippedEmailSentAt && (
                <span className="text-ink/50">
                  {" "}
                  &middot;{" "}
                  {order.shippedEmailSentAt.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              Tracking: {order.trackingNumber} &middot;{" "}
              <a href={order.trackingUrl!} target="_blank" rel="noreferrer" className="text-gold-dark hover:underline">
                View link
              </a>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <ResendButton id={order.id} />
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink/50 hover:text-ink">
              Edit tracking info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-ink/10 pt-6">
      <p className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-ink/65">
        <Truck className="h-3.5 w-3.5" /> Shipping &amp; Tracking
      </p>
      <form action={formAction} className="space-y-3 rounded-[6px] border border-ink/10 bg-paper-dim p-4">
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label htmlFor="trackingNumber" className="mb-1 block text-xs text-ink/65">
            Tracking Number
          </label>
          <input
            id="trackingNumber"
            name="trackingNumber"
            defaultValue={order.trackingNumber ?? ""}
            placeholder="e.g. 1Z999AA10123456784"
            className={inputClass}
          />
          {err("trackingNumber") && <p className="mt-1 text-xs text-red-700">{err("trackingNumber")}</p>}
        </div>
        <div>
          <label htmlFor="trackingUrl" className="mb-1 block text-xs text-ink/65">
            Tracking Link
          </label>
          <input
            id="trackingUrl"
            name="trackingUrl"
            defaultValue={order.trackingUrl ?? ""}
            placeholder="https://www.dhl.com/track?id=..."
            className={inputClass}
          />
          {err("trackingUrl") && <p className="mt-1 text-xs text-red-700">{err("trackingUrl")}</p>}
        </div>
        {state.error && <p className="text-xs text-red-700">{state.error}</p>}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-[3px] border border-ink bg-ink px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
          >
            {pending ? "Sending..." : "Mark as Shipped & Notify Customer"}
          </button>
          {order.trackingNumber && (
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink/50 hover:text-ink">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ResendButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult(await resendShippedEmail(id));
          })
        }
        className="text-xs text-ink/65 hover:text-ink disabled:opacity-60"
      >
        {pending ? "Sending..." : "Resend notification"}
      </button>
      {result?.error && <p className="max-w-[200px] text-right text-xs text-red-700">{result.error}</p>}
    </div>
  );
}
