"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export default function Newsletter({ dark = true }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 text-sm ${
              dark ? "text-gold" : "text-gold-dark"
            }`}
          >
            <Check className="h-4 w-4" /> You&rsquo;re on the list — welcome to
            SaFaLight.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 border-b ${
              dark ? "border-paper/30" : "border-ink/25"
            } pb-2`}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className={`w-full bg-transparent text-sm outline-none placeholder:opacity-50 ${
                dark ? "text-paper placeholder:text-paper" : "text-ink placeholder:text-ink"
              }`}
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] transition-colors duration-300 ${
                dark
                  ? "bg-paper text-ink hover:bg-gold-dark hover:text-paper"
                  : "bg-ink text-paper hover:bg-gold-dark"
              }`}
            >
              {status === "loading" ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
