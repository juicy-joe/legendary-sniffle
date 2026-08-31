import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductsExplorer from "@/components/ProductsExplorer";
import CollectionsShowcase, { type CollectionSummary } from "@/components/CollectionsShowcase";
import { getCatalog, getCollections } from "@/lib/catalog";
import { slugify } from "@/lib/slugify";

export const metadata: Metadata = {
  title: "Designer Table Lamps",
  description:
    "Discover the full collection of luxury, hand-blown designer table lamps made from lead-free optical crystalline glass. Each NatureSphere piece is a unique original, color variations are a natural signature of the handcrafting process. These ambient mood lights are designed to transform your space with atmosphere and character, not just illumination. Available in NatureSphere and MoodMAX collections.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const [catalog, collectionRows] = await Promise.all([getCatalog(), getCollections()]);

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
          Every piece is mouth-blown from high-clarity crystalline glass and hand-finished to order. Within our
          NatureSphere collection, each sphere is individually shaped, so natural variations in color patterns
          occur, your lamp will be a unique original, distinct from the online image. Our MoodMAX collection offers
          a complementary aesthetic with its own character. Filter by color or finish to find the piece that fits
          your space. These are ambient lights, crafted to create mood and character, not merely to illuminate a
          room.
        </p>
      </RevealOnScroll>

      <CollectionsShowcase collections={showcaseCollections} />

      <ProductsExplorer collectionOrder={collectionOrder} />
    </div>
  );
}
