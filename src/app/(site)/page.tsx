import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import TextLink from "@/components/TextLink";
import RevealOnScroll from "@/components/RevealOnScroll";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import StatCounter from "@/components/StatCounter";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import LampIllustration from "@/components/LampIllustration";
import { getCatalog } from "@/lib/catalog";
import { getHomeContent } from "@/lib/content";

export default async function Home() {
  const [products, content] = await Promise.all([getCatalog(), getHomeContent()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const featured = products.filter((p) => p.featured);
  // The homepage's dedicated "featured collection" spotlight — currently
  // NatureSphere's, previously The Chroma Editions. If the named collection
  // is ever retired again, this section simply won't render (see below)
  // rather than showing an empty grid under a live headline.
  const featuredCollectionProducts = products.filter((p) => p.collection === "NatureSphere's");
  const craftMosaic = ["obsidian-ceramic-drum", "meridian-glass-cone", "vesper-brass-orb", "atelier-marble-disc"]
    .map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  // Falls back to any product with photos, then to any product at all, so
  // the hero never breaks if this exact slug is ever renamed or removed via
  // the admin panel.
  const heroProduct =
    bySlug.get("carnevale-confetti-sphere") ??
    products.find((p) => p.images?.length) ??
    products[0];

  if (!heroProduct) {
    // No products at all — genuinely nothing to render the hero around.
    return null;
  }

  return (
    <>
      {/* Hero — Theme C: one product, full-bleed, minimal text bottom-left.
          No split layout, no stat counters, no decorative eyebrow icon —
          the image is the argument. */}
      <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-paper">
        {heroProduct.images?.length ? (
          <Image
            src={heroProduct.images[0].src}
            alt={`${heroProduct.name} by ${heroProduct.designer}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <LampIllustration product={heroProduct} className="h-full w-full" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-14 md:px-14 md:pb-16">
          <div className="max-w-lg">
            <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-paper/70">
              {content.heroEyebrow}
            </p>
            <h1 className="font-serif text-4xl font-light leading-[1.08] md:text-6xl">
              {content.heroHeadline} {content.heroHeadlineAccent}.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/65 md:text-base">
              {content.heroSubtext}
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-b border-paper/40 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:border-paper"
            >
              Explore the Collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <p className="absolute bottom-14 right-6 hidden text-[11px] uppercase tracking-[0.16em] text-paper/60 md:right-14 md:block">
          {heroProduct.name} &middot; {heroProduct.collection}
        </p>
      </section>

      <Marquee
        items={[
          "Étienne Voss",
          "Nadia Kessler",
          "Otto Reyne",
          "Marchetti & Lin",
          "Hand-Finished",
          "Individually Numbered",
        ]}
      />

      {/* Featured collection */}
      <section id="featured" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              The Selection
            </p>
            <h2 className="font-serif text-4xl text-ink md:text-5xl">
              Featured Pieces
            </h2>
          </div>
          <TextLink href="/products">View Full Collection</TextLink>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Featured collection spotlight (currently NatureSphere's) — only
          renders when that collection actually has products in it, so an
          emptied-out or renamed collection never leaves a headline sitting
          over a blank grid. */}
      {featuredCollectionProducts.length > 0 && (
        <section className="bg-paper-dim py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
                  New &mdash; NatureSphere&rsquo;s
                </p>
                <h2 className="max-w-xl font-serif text-4xl leading-tight text-ink md:text-5xl">
                  {content.chromaHeadline}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/60">
                  {content.chromaSubtext}
                </p>
              </div>
              <TextLink href="/products">Shop NatureSphere&rsquo;s</TextLink>
            </RevealOnScroll>

            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCollectionProducts.map((product, i) => (
                <ProductCard key={product.slug} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Craft / stats */}
      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-10">
          <RevealOnScroll>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              The Craft
            </p>
            <h2 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
              {content.craftHeadline}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/60">
              {content.craftSubtext}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <StatCounter value={100} suffix="%" label="Hand-Finished" />
              <StatCounter value={8} suffix=" wks" label="Avg. Lead Time" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1} className="grid grid-cols-2 gap-6">
            {craftMosaic.map((p) => (
              <div
                key={p.slug}
                className="aspect-square rounded-[6px] border border-ink/10 bg-paper-dim p-5"
              >
                <LampIllustration product={p} animated={false} className="h-full w-full" />
              </div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* "Design Your Light" configurator section is intentionally pulled
          for now — not deleted, just not wired in. Re-add by restoring this
          block (see git history) once it's ready to ship; the component
          itself is untouched at @/components/AmbienceConfigurator. */}

      {/* Testimonials */}
      <section className="bg-ink py-24 text-paper md:py-32">
        <RevealOnScroll className="px-6">
          <Testimonials />
        </RevealOnScroll>
      </section>

      {/* CTA / Newsletter */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center md:px-10 md:py-32">
        <RevealOnScroll>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
            Stay Illuminated
          </p>
          <h2 className="font-serif text-4xl text-ink md:text-5xl">
            Join the Atelier List
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink/60">
            New releases, limited editions, and designer studio visits &mdash;
            delivered rarely, and only when it matters.
          </p>
          <div className="mt-8 flex justify-center">
            <Newsletter dark={false} />
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
