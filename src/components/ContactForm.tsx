"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { submitEnquiry } from "@/app/(site)/contact/actions";

const interests = [
  "General Inquiry",
  "Request a Commission",
  "Trade / Design Firm",
  "Press",
];

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitEnquiry, {});

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
        <h3 className="font-serif text-2xl font-light text-ink">Message Sent</h3>
        <p className="text-sm text-ink/60">
          Thank you for reaching out. A member of our design team will reply
          within one business day.
        </p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {/* Honeypot — hidden from real visitors (off-screen, unreachable by
          Tab), so anything that fills it in is almost certainly a bot. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Full Name" name="name" error={state.fieldErrors?.name} required />
        <Field label="Email Address" name="email" type="email" error={state.fieldErrors?.email} required />
      </div>

      <fieldset>
        <legend className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">
          I&rsquo;m Interested In
        </legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((label, i) => (
            <label key={label} className="cursor-pointer">
              <input
                type="radio"
                name="interest"
                value={label}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span className="inline-block rounded-[3px] border border-ink/20 px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-ink/60 transition-colors duration-300 peer-checked:border-gold-dark peer-checked:bg-gold-dark/10 peer-checked:text-gold-dark peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold-dark peer-focus-visible:outline-offset-2">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
          className="w-full resize-none rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
          placeholder="Tell us about the space, the piece, or the question on your mind."
        />
        {state.fieldErrors?.message && (
          <p id="message-error" role="alert" className="mt-1.5 text-xs text-red-700">
            {state.fieldErrors.message}
          </p>
        )}
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
        {pending ? "Sending..." : "Send Message"}
        <AnimatePresence>
          {!pending && <ArrowRight className="h-3.5 w-3.5" />}
        </AnimatePresence>
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
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65"
      >
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
