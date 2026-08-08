"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const interests = [
  "General Inquiry",
  "Request a Commission",
  "Trade / Design Firm",
  "Press",
];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "Please share your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Please enter a valid email.";
    if (!message) nextErrors.message = "Tell us a little about what you need.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 1000);
  };

  if (status === "done") {
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
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Full Name" name="name" error={errors.name} required />
        <Field label="Email Address" name="email" type="email" error={errors.email} required />
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
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="w-full resize-none rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
          placeholder="Tell us about the space, the piece, or the question on your mind."
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1.5 text-xs text-red-700">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2.5 rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
        <AnimatePresence>
          {status !== "loading" && <ArrowRight className="h-3.5 w-3.5" />}
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
