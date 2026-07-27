import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  arrow?: boolean;
  tone?: "ink" | "paper";
};

export default function TextLink({
  href,
  children,
  className,
  arrow = true,
  tone = "ink",
}: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        "group/link inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]",
        tone === "ink" ? "text-ink" : "text-paper",
        className
      )}
    >
      <span className="relative">
        {children}
        <span
          className={clsx(
            "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-500 ease-out group-hover/link:origin-right group-hover/link:scale-x-0",
            tone === "ink" ? "bg-ink/30" : "bg-paper/30"
          )}
        />
        <span
          className={clsx(
            "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover/link:origin-left group-hover/link:scale-x-100"
          )}
        />
      </span>
      {arrow && (
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/link:translate-x-1" />
      )}
    </Link>
  );
}
