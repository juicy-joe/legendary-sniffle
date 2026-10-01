import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductsExplorer from "@/components/ProductsExplorer";
import CollectionsShowcase, { type CollectionSummary } from "@/components/CollectionsShowcase";
import { getCatalog, getCollections } from "@/lib/catalog";
import { getProductsContent } from "@/lib/content";
import { slugify } from "@/lib/slugify";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Designer Table Lamps",
  description:
    "Discover the full collection of luxury, hand-blown designer table lamps made from lead-free optical crystalline glass. Each NatureSPHERE piece is a unique original, color variations are a natural signature of the handcrafting process. These ambient mood lights are designed to transform your space with atmosphere and character, not just illumination. Available in NatureSPHERE and MoodMAX collections.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const locale = await getLocale();
  const [catalog, collectionRows, content, dict] = await Promise.all([
    getCatalog(),
    getCollections(),
    getProductsContent(),
    getUiTranslations(locale),
  ]);

  // Canonical collection order (alphabetical, from the admin-managed
  // Collection table) — passed to ProductsExplorer too so the showcase
  // cards above and the grouped sections below list collections in the
  // same order and #slug anchors line up.
  const collectionOrder = collectionRows.map((c) => c.name);

  const showcaseCollections: CollectionSummary[] = collectionRows
    .map((c) => {
      const products = catalog.filter((p) => p.collection === c.name);
      const images = products
        .filter((p) => p.images?.length)
        .map((p) => ({ src: p.images![0].src, alt: p.name }));
      return {
        name: c.name,
        slug: slugify(c.name),
        description: c.description,
        count: products.length,
        images,
      };
    })
    // A collection with no photographed products yet has nothing to put in
    // a slideshow — it still appears in the grid below once it has pieces,
    // just skips the showcase card until then.
    .filter((c) => c.images.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">{t(dict, "breadcrumb.home", "Home")}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">{t(dict, "breadcrumb.products", "Products")}</span>
      </nav>
      <RevealOnScroll className="mb-14 max-w-2xl">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
          {content.heroEyebrow}
        </p>
        <h1 className="font-serif text-5xl text-ink md:text-6xl">
          {content.heroHeadline}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink/60">
          {content.intro}
        </p>
      </RevealOnScroll>

      <CollectionsShowcase collections={showcaseCollections} dict={dict} />

      <ProductsExplorer collectionOrder={collectionOrder} />
    </div>
  );
}
