import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductsExplorer from "@/components/ProductsExplorer";
import CollectionsShowcase, { type CollectionSummary } from "@/components/CollectionsShowcase";
import { getCatalog, getCollections } from "@/lib/catalog";
import { getProductsContent } from "@/lib/content";
import { slugify } from "@/lib/slugify";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";

const faqs = [
  {
    q: "What is a designer table lamp?",
    a: "A designer table lamp is a lighting object created as a piece of design in its own right — chosen for its form, materials, and character, not just its brightness. Every Ollerialight table lamp is designed to work as a sculptural object whether it's switched on or off.",
  },
  {
    q: "What materials are used?",
    a: "Every Ollerialight table lamp is made from mouth-blown crystalline glass, individually hand-coloured during the glassblowing process with our partner European glass makers.",
  },
  {
    q: "Are the lamps handmade?",
    a: "Yes. Each sphere is mouth-blown and hand-coloured by glassmakers, which is why colour patterns vary slightly from piece to piece — your lamp will be distinct from the exact one shown online.",
  },
  {
    q: "What bulb does the lamp use?",
    a: "Each lamp takes a 220–240V E27 bulb and ships with a warm white bulb included, so it's ready to use on arrival.",
  },
  {
    q: "Are the lamps dimmable?",
    a: "Yes, every Ollerialight table lamp is dimmable, so you can adjust it from a bright accent to a soft ambient glow.",
  },
  {
    q: "Where can the lamps be used?",
    a: "They work equally well on a console, sideboard, nightstand, or desk, and are also specified for hospitality and interior design projects — see our Consulting page for hotel, restaurant, and villa lighting.",
  },
  {
    q: "How are the lamps shipped?",
    a: "Regular shipping within the EU is free. Delivery options and costs for other regions are shown at checkout before you confirm your order.",
  },
  {
    q: "How should the glass be cared for?",
    a: "Dust with a soft, dry cloth and avoid abrasive cleaners or solvents on the glass surface. Always unplug the lamp before cleaning.",
  },
];

export const metadata: Metadata = {
  title: "Designer Table Lamps — Hand-Blown Glass",
  description:
    "Discover Ollerialight's designer table lamps: mouth-blown crystalline glass, hand-coloured by hand, in the MoodMAX and NatureSPHERE's collections. Sculptural lighting for contemporary interiors.",
  alternates: { canonical: "/table-lamps" },
};

export default async function TableLampsPage() {
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
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Table Lamps" },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        })}
      />
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">{t(dict, "breadcrumb.home", "Home")}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">{t(dict, "breadcrumb.products", "Table Lamps")}</span>
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

      <RevealOnScroll className="mb-20 max-w-3xl">
        <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">
          Designer Table Lamps for Contemporary Interiors
        </h2>
        <p className="text-base leading-relaxed text-ink/70">
          An Ollerialight table lamp is designed to work as a console or sideboard centrepiece,
          a bedside light, or a desk companion — anywhere a room benefits from a warm, sculptural
          glow rather than a flat wash of light. The same hand-blown glass that makes each piece
          genuinely one of a kind also makes it suited to hospitality and interior design
          projects: our pieces are specified for hotels, restaurants, and private villas through
          our{" "}
          <Link href="/consulting" className="underline underline-offset-2 hover:text-gold-dark">
            Consulting &amp; Projects
          </Link>{" "}
          service.
        </p>
      </RevealOnScroll>

      <RevealOnScroll className="mb-14">
        <h2 className="mb-2 font-serif text-2xl text-ink md:text-3xl">
          Explore Our Table Lamp Collections
        </h2>
        <p className="max-w-2xl text-sm text-ink/60">
          Each collection has its own design language — explore the full story behind each one.
        </p>
      </RevealOnScroll>
      <CollectionsShowcase collections={showcaseCollections} dict={dict} />

      <RevealOnScroll className="mb-8">
        <h2 className="font-serif text-2xl text-ink md:text-3xl">Featured Designer Table Lamps</h2>
      </RevealOnScroll>
      <ProductsExplorer collectionOrder={collectionOrder} />

      <RevealOnScroll className="mt-24 max-w-3xl border-t border-ink/10 pt-14">
        <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">
          Hand-Blown Glass Table Lamps
        </h2>
        <p className="text-base leading-relaxed text-ink/70">
          Every sphere starts as molten glass, mouth-blown and hand-coloured by glassmakers at
          our partner European glass makers — no two pieces take colour in
          exactly the same way.{" "}
          <Link href="/hand-blown-glass" className="underline underline-offset-2 hover:text-gold-dark">
            Learn more about our hand-blown glass
          </Link>
          .
        </p>
      </RevealOnScroll>

      <RevealOnScroll className="mt-20 max-w-3xl border-t border-ink/10 pt-14">
        <h2 className="mb-6 font-serif text-2xl text-ink md:text-3xl">
          Frequently Asked Questions
        </h2>
        <dl className="space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-serif text-lg text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink/65">{f.a}</dd>
            </div>
          ))}
        </dl>
      </RevealOnScroll>
    </div>
  );
}
