import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import WholesaleApplyForm from "@/components/WholesaleApplyForm";

export const metadata: Metadata = {
  title: "Apply for a Trade Account",
  description: "Apply for a SaFaLight trade account to access wholesale pricing and place bulk orders.",
  alternates: { canonical: "/trade/apply" },
  robots: { index: false, follow: false },
};

export default function TradeApplyPage() {
  return (
    <div>
      <section className="bg-ink py-24 text-paper md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/trade" className="hover:text-paper">Trade</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">Apply</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Trade Account</p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">Apply for Trade Pricing</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              For retailers, designers, and hospitality buyers ordering at volume. We review every application
              personally.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20 md:px-10">
        <RevealOnScroll>
          <WholesaleApplyForm />
        </RevealOnScroll>
        <p className="mt-8 text-center text-sm text-ink/60">
          Already have a trade account?{" "}
          <Link href="/trade/login" className="text-gold-dark hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </div>
  );
}
