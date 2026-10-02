import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductCard from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hand-Blown Glass Table Lamps",
  description:
    "How Ollerialight's hand-blown crystalline glass table lamps are made: mouth-blown and hand-coloured at our partner glassworks in L'Olleria, Valencia.",
  alternates: { canonical: "/hand-blown-glass" },
};

export default async function HandBlownGlassPage() {
  const locale = await getLocale();
  const [catalog, dict] = await Promise.all([getCatalog(), getUiTranslations(locale)]);

  return (
    <div>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Table Lamps", item: `${siteUrl}/table-lamps` },
            { "@type": "ListItem", position: 3, name: "Hand-Blown Glass" },
          ],
        })}
      />
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/table-lamps" className="hover:text-paper">Table Lamps</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">Hand-Blown Glass</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Materials &amp; Craft</p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              Hand-Blown Glass Table Lamps
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              Every Ollerialight sphere starts as molten crystalline glass, shaped entirely by
              hand at our partner glassworks in L&rsquo;Olleria, Valencia.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-24">
        <RevealOnScroll className="mb-14">
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">What Mouth-Blown Means</h2>
          <p className="text-base leading-relaxed text-ink/70">
            Mouth-blowing is a centuries-old glassmaking technique: a glassmaker gathers molten
            glass on the end of a blowpipe and shapes it by breath, gravity, and hand tools alone
            — no mould dictates the final form of the colour inside it. It&rsquo;s slower and far
            less consistent than machine-pressed glass, which is exactly why it produces results a
            machine can&rsquo;t: subtle variation in wall thickness, bubbles, and colour
            distribution that make every finished piece genuinely singular.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="mb-14">
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">Hand-Coloured, Not Printed</h2>
          <p className="text-base leading-relaxed text-ink/70">
            The colour in an Ollerialight sphere isn&rsquo;t a coating or a print — it&rsquo;s
            introduced into the glass itself while it&rsquo;s still workable, by hand, during the
            blowing process. That&rsquo;s why a gradient like the one running through Deep Purple or
            Sunset reads as depth rather than a flat surface effect, and why no two spheres take
            colour in quite the same way.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="mb-14">
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">Every Piece Is Unique</h2>
          <p className="text-base leading-relaxed text-ink/70">
            Because each sphere is shaped and coloured individually, your lamp will differ in
            small ways from the exact piece photographed for the website — in the precise line of
            a gradient, the placement of an inclusion, the thickness of the glass. This is a
            natural signature of the handcrafting process, not a flaw to be corrected.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">From Glass to Light Object</h2>
          <p className="text-base leading-relaxed text-ink/70">
            Once shaped and cooled, each sphere is fitted with its lighting components and a
            turned wooden base, then checked before it leaves the workshop. The result is a table
            lamp designed to work as a sculptural object in daylight, and as a warm, diffused
            light source once switched on — see our{" "}
            <Link href="/table-lamps" className="underline underline-offset-2 hover:text-gold-dark">
              full collection of designer table lamps
            </Link>
            .
          </p>
        </RevealOnScroll>
      </section>

      <section className="bg-paper-dim py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">Shop Hand-Blown Glass Lamps</h2>
            <Link
              href="/table-lamps"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-gold-dark"
            >
              View All Table Lamps
            </Link>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
