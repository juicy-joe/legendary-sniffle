"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { submitSpecialOrderRequest } from "@/app/(site)/trade/portal/requests/actions";

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

export default function SpecialOrderRequestForm() {
  const [state, formAction, pending] = useActionState(submitSpecialOrderRequest, {});
  const err = (field: string) => state.fieldErrors?.[field];

  if (state.success) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[6px] border border-gold-dark/30 bg-gold-dark/5 p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-dark text-paper">
          <Check className="h-5 w-5" />
        </div>
        <h3 className="font-serif text-2xl font-light text-ink">Request Sent</h3>
        <p className="text-sm text-ink/60">
          We&rsquo;ve received your request and will get back to you directly with next steps.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div>
        <label htmlFor="subject" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Subject
        </label>
        <input id="subject" name="subject" placeholder="e.g. Custom finish for a 40-unit hotel order" className={inputClass} />
        {err("subject") && <p className="mt-1.5 text-xs text-red-700">{err("subject")}</p>}
      </div>

      <div>
        <label htmlFor="quantity" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Quantity <span className="normal-case text-ink/40">(optional)</span>
        </label>
        <input id="quantity" name="quantity" type="number" min={1} step={1} className={`${inputClass} max-w-[160px]`} />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Details
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="w-full resize-none rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
          placeholder="Tell us what you need — a custom spec, a bulk quote, a design you'd like made."
        />
        {err("message") && <p className="mt-1.5 text-xs text-red-700">{err("message")}</p>}
      </div>

      <div>
        <label htmlFor="file" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Attach a Design File <span className="normal-case text-ink/40">(optional, up to 4MB)</span>
        </label>
        <input id="file" name="file" type="file" className="w-full text-sm text-ink/80" />
        <p className="mt-1.5 text-xs text-ink/50">Larger files? Email them to us directly instead.</p>
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
        {pending ? "Sending..." : "Send Request"}
      </button>
    </form>
  );
}
