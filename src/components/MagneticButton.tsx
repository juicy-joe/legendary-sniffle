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

// Theme C ("Monochrome Atelier") keeps interaction to a single signature
// move — the custom cursor (see CursorGlow) — rather than scattering
// hover gimmicks across every control, so this no longer follows the
// pointer. Name/props/variants are unchanged so its existing callers
// (About, AmbienceConfigurator) needed no edits.
export default function MagneticButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: Props) {
  const styles = clsx(
    "group relative inline-flex items-center justify-center gap-2.5 rounded-[3px] px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={styles}>
      {children}
    </button>
  );
}
