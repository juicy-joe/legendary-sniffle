import type { Metadata } from "next";
import Link from "@/components/Link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductCard from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { getLocale, getUiTranslations, getContentFields, localeAlternates, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";
import TrackViewItemList from "@/components/analytics/TrackViewItemList";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Hand-Blown Glass Table Lamps",
    description:
      "How Ollerialight's hand-blown crystalline glass table lamps are made, and the two different colouring techniques behind MoodMAX and NatureSPHERE's.",
    alternates: localeAlternates(locale, "/hand-blown-glass"),
  };
}

// English fallbacks — the single source of truth for this page's copy, used
// whenever a locale has no translation row yet (see getContentFields).
const EN = {
  heroEyebrow: "Materials & Craft",
  heroHeading: "Hand-Blown Glass Table Lamps",
  heroSubtext:
    "Every Ollerialight sphere starts as molten crystalline glass, shaped entirely by hand by our partner European glass makers.",
  section1Heading: "What Mouth-Blown Means",
  section1Body:
    "Mouth-blowing is a centuries-old glassmaking technique: a glassmaker gathers molten glass on the end of a blowpipe and shapes it by breath, gravity, and a traditional glassblowing mould. It's slower and far less consistent than fully machine-pressed glass, which is exactly why it produces results a machine can't: subtle variation in wall thickness, bubbles, and finish that make every piece genuinely singular.",
  section2Heading: "Two Ways We Bring Colour to Glass",
  section2Part1: "Our two collections aren't just different colourways — they're coloured in two genuinely different ways. ",
  section2Bold1: "MoodMAX is hand-painted",
  section2Part2:
    ": once a sphere has been mouth-blown and cooled, each gradient — turquoise into purple, red into gold — is applied to the glass by hand, so the exact blend is never quite the same twice.",
  section2Bold2: "NatureSPHERE's takes a different approach",
  section2Part3:
    ": its colour is introduced directly into the molten glass during melting, so it runs through the full thickness of the glass rather than sitting on its surface. That's what gives pieces like Lava Glow and Geyser Glow their sense of depth — the colour isn't applied to the glass, it's part of it.",
  section3Heading: "Every Piece Is Unique",
  section3Body:
    "Because each sphere is shaped and coloured individually, your lamp will differ in small ways from the exact piece photographed for the website — in the precise line of a gradient, the placement of an inclusion, the thickness of the glass. This is a natural signature of the handcrafting process, not a flaw to be corrected, and it's exactly what separates a piece of decorative lighting like this from anything mass-produced.",
  section4Heading: "From Glass to Light Object",
  section4BodyPrefix:
    "Once shaped and cooled, each sphere is fitted with its lighting components and a turned wooden base, then checked before it leaves the workshop. The result is a table lamp designed to work as a sculptural object in daylight, and as a warm, diffused light source once switched on — see our",
  section4LinkText: "full collection of designer table lamps",
};

export default async function HandBlownGlassPage() {
  const locale = await getLocale();
  const [catalog, dict, content] = await Promise.all([
    getCatalog(),
    getUiTranslations(locale),
    getContentFields(locale, "StaticPage", "handBlownGlass"),
  ]);
  const c = (field: keyof typeof EN) => content[field] ?? EN[field];

  return (
    <div>
      <TrackViewItemList products={catalog} listName="Hand-Blown Glass" />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${locale}` },
            { "@type": "ListItem", position: 2, name: "Table Lamps", item: `${siteUrl}/${locale}/table-lamps` },
            { "@type": "ListItem", position: 3, name: "Hand-Blown Glass" },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hand-Blown Glass Table Lamps",
          url: `${siteUrl}/${locale}/hand-blown-glass`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: catalog.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${siteUrl}/${locale}/products/${p.slug}`,
              name: p.name,
            })),
          },
        })}
      />
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/table-lamps" className="hover:text-paper">{t(dict, "breadcrumb.products", "Table Lamps")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{t(dict, "breadcrumb.handBlownGlass", "Hand-Blown Glass")}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">{c("heroEyebrow")}</p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              {c("heroHeading")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              {c("heroSubtext")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-24">
        <RevealOnScroll className="mb-14">
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">{c("section1Heading")}</h2>
          <p className="text-base leading-relaxed text-ink/70">{c("section1Body")}</p>
        </RevealOnScroll>

        <RevealOnScroll className="mb-14">
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">{c("section2Heading")}</h2>
          <p className="text-base leading-relaxed text-ink/70">
            {c("section2Part1")}
            <strong className="font-medium text-ink">{c("section2Bold1")}</strong>
            {c("section2Part2")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            <strong className="font-medium text-ink">{c("section2Bold2")}</strong>
            {c("section2Part3")}
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="mb-14">
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">{c("section3Heading")}</h2>
          <p className="text-base leading-relaxed text-ink/70">{c("section3Body")}</p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-3xl">{c("section4Heading")}</h2>
          <p className="text-base leading-relaxed text-ink/70">
            {c("section4BodyPrefix")}{" "}
            <Link href="/table-lamps" className="underline underline-offset-2 hover:text-gold-dark">
              {c("section4LinkText")}
            </Link>
            .
          </p>
        </RevealOnScroll>
      </section>

      <section className="bg-paper-dim py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">{t(dict, "handBlownGlass.shopHeading", "Shop Hand-Blown Glass Lamps")}</h2>
            <Link
              href="/table-lamps"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-gold-dark"
            >
              {t(dict, "designers.viewAllTableLamps", "View All Table Lamps")}
            </Link>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} listName="Hand-Blown Glass" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
