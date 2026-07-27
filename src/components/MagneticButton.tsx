"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "ghost-light" | "paper";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-ink text-paper hover:bg-gold-dark border border-ink hover:border-gold-dark",
  ghost:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  "ghost-light":
    "border border-paper/30 text-paper hover:border-paper hover:bg-paper hover:text-ink",
  paper:
    "bg-paper text-ink border border-paper hover:bg-gold-dark hover:border-gold-dark hover:text-paper",
};

export default function MagneticButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || disabled) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * 0.22);
    y.set(relY * 0.22);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const styles = clsx(
    "group relative inline-flex items-center justify-center gap-2.5 rounded-[3px] px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className
  );

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="inline-block"
    >
      {href ? (
        <Link href={href} className={styles}>
          {children}
        </Link>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className={styles}>
          {children}
        </button>
      )}
    </motion.div>
  );
}
