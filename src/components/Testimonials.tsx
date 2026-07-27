"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "The Aurelia lamp is the first thing guests ask about. It doesn't light a room — it anchors it.",
    name: "Interior Designer, Private Residence",
    location: "New York",
  },
  {
    quote:
      "SaFaLight's team treated our commission like a gallery acquisition. The craftsmanship is genuinely museum-grade.",
    name: "Boutique Hotel Group",
    location: "Lisbon",
  },
  {
    quote:
      "Solstice sits on my desk and I still catch myself staring at the patina. Worth every hour on the waitlist.",
    name: "Private Collector",
    location: "Zurich",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="mx-auto max-w-2xl text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative min-h-[180px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-serif text-2xl font-light italic leading-relaxed text-paper md:text-3xl">
              &ldquo;{testimonials[index].quote}&rdquo;
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-paper/45">
              {testimonials[index].name} &middot; {testimonials[index].location}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {testimonials.map((t, i) => (
          <button
            key={t.name}
            type="button"
            aria-label={`Show testimonial ${i + 1} of ${testimonials.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-gold" : "w-1.5 bg-paper/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
