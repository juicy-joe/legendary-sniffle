import Link from "next/link";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import TextLink from "@/components/TextLink";
import RevealOnScroll from "@/components/RevealOnScroll";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import ProductPhoto from "@/components/ProductPhoto";
import StatCounter from "@/components/StatCounter";
import AmbienceConfigurator from "@/components/AmbienceConfigurator";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import LampIllustration from "@/components/LampIllustration";
import { getCatalog } from "@/lib/catalog";
import { getHomeContent } from "@/lib/content";

export default async function Home() {
  const [products, content] = await Promise.all([getCatalog(), getHomeContent()]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const featured = products.filter((p) => p.featured);
  const chromaEditions = products.filter((p) => p.collection === "The Chroma Editions");
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
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink text-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 20%, rgba(163,133,79,0.22), transparent 70%)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-10">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 border border-paper/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-paper/70">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              {content.heroEyebrow}
            </div>
            <h1 className="font-serif text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              {content.heroHeadline}{" "}
              <span className="italic text-gold" style={{ fontWeight: 400 }}>
                {content.heroHeadlineAccent}
              </span>
              .
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-paper/60 md:text-lg">
              {content.heroSubtext}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href="/products" variant="paper">
                Explore the Collection <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
              <MagneticButton href="/contact" variant="ghost-light">
                Book a Consultation
              </MagneticButton>
            </div>

            <div className="mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-paper/10 pt-8">
              <StatCounter value={4} label="Resident Designers" dark />
              <StatCounter value={1200} suffix="+" label="Homes Illuminated" dark />
              <StatCounter value={12} label="Rare Materials" dark />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-square">
              {heroProduct.images?.length ? (
                <ProductPhoto
                  images={heroProduct.images}
                  alt={`${heroProduct.name} by ${heroProduct.designer}`}
                  priority
                  showSelector={false}
                  className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <LampIllustration product={heroProduct} className="h-full w-full" />
              )}
            </div>
            <p className="mt-5 text-center text-[11px] uppercase tracking-[0.16em] text-paper/60">
              {heroProduct.name} &middot; {heroProduct.collection} &middot;{" "}
              <Link href={`/products/${heroProduct.slug}`} className="underline decoration-paper/30 underline-offset-2 hover:text-gold hover:decoration-gold">
                see it up close
              </Link>
            </p>
          </div>
        </div>

        <Link
          href="#featured"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-paper/60 transition-colors hover:text-gold"
          aria-label="Scroll to featured collection"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </Link>
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

      {/* Chroma Editions spotlight */}
      <section className="bg-paper-dim py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
                New &mdash; The Chroma Editions
              </p>
              <h2 className="max-w-xl font-serif text-4xl leading-tight text-ink md:text-5xl">
                {content.chromaHeadline}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/60">
                {content.chromaSubtext}
              </p>
            </div>
            <TextLink href="/products?category=Glass">Shop the Editions</TextLink>
          </RevealOnScroll>

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {chromaEditions.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

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

      {/* Configurator */}
      <section className="border-y border-ink/10 bg-paper-dim py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <RevealOnScroll className="mb-14 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              Design Your Light
            </p>
            <h2 className="font-serif text-4xl text-ink md:text-5xl">
              Preview a Finish, Live
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <AmbienceConfigurator />
          </RevealOnScroll>
        </div>
      </section>

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
