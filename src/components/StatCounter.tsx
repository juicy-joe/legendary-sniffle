"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function StatCounter({
  value,
  suffix = "",
  label,
  dark = false,
}: {
  value: number;
  suffix?: string;
  label: string;
  dark?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 90 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.floor(latest).toLocaleString()}${suffix}`;
      }
    });
    return unsub;
  }, [spring, suffix]);

  return (
    <div className="text-center md:text-left">
      <span
        ref={ref}
        className={`block font-serif text-4xl font-light md:text-5xl ${
          dark ? "text-gold-light" : "text-gold-dark"
        }`}
      >
        0{suffix}
      </span>
      <p
        className={`mt-2 text-[11px] uppercase tracking-[0.2em] ${
          dark ? "text-paper/45" : "text-ink/50"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
