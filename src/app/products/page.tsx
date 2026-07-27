import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductsExplorer from "@/components/ProductsExplorer";

export const metadata: Metadata = {
  title: "Designer Table Lamps",
  description:
    "Browse SaFaLight's full collection of luxury designer table lamps in marble, brass, alabaster, crystal, ceramic and glass — each hand-finished and individually numbered.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink/45">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">Products</span>
      </nav>
      <RevealOnScroll className="mb-14 max-w-2xl">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
          The Collection
        </p>
        <h1 className="font-serif text-5xl text-ink md:text-6xl">
          Designer Table Lamps
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink/60">
          Every piece below is hand-finished to order by one of our resident
          designers. Filter by material, or sort to find a piece that fits
          your space and your patience for waiting well.
        </p>
      </RevealOnScroll>

      <ProductsExplorer />
    </div>
  );
}
