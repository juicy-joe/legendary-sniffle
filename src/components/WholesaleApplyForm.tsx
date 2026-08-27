"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { submitWholesaleApplication } from "@/app/(site)/trade/apply/actions";

export default function WholesaleApplyForm() {
  const [state, formAction, pending] = useActionState(submitWholesaleApplication, {});

  if (state.success) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start gap-3 rounded-[6px] border border-gold-dark/30 bg-gold-dark/5 p-8"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-dark text-paper">
          <Check className="h-5 w-5" />
        </div>
        <h3 className="font-serif text-2xl font-light text-ink">Application Received</h3>
        <p className="text-sm text-ink/60">
          Thank you for applying. We review every trade application personally and will be in touch shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-7" noValidate>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Business Name" name="businessName" error={state.fieldErrors?.businessName} required />
        <Field label="Contact Name" name="contactName" error={state.fieldErrors?.contactName} required />
        <Field label="Email Address" name="email" type="email" error={state.fieldErrors?.email} required />
        <Field label="Phone" name="phone" type="tel" error={state.fieldErrors?.phone} />
        <Field label="VAT / Tax ID" name="vatId" error={state.fieldErrors?.vatId} />
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
          Tell Us About Your Business
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          className="w-full resize-none rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
          placeholder="What you sell, where, and roughly how much volume you're expecting."
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2.5 rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Application"}
        <AnimatePresence>{!pending && <ArrowRight className="h-3.5 w-3.5" />}</AnimatePresence>
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
