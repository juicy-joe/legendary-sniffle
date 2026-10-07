import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import ProductCard from "./ProductCard";
import TextLink from "./TextLink";
import type { CatalogProduct } from "@/lib/catalog";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export default async function CollectionLanding({
  eyebrow,
  headline,
  intro,
  story,
  materials,
  dimensions,
  designer,
  products,
}: {
  eyebrow: string;
  headline: string;
  intro: string;
  story: string;
  materials: string;
  dimensions: string;
  designer: string;
  products: CatalogProduct[];
}) {
  const locale = await getLocale();
  const dict = await getUiTranslations(locale);

  return (
    <div>
      <section className="bg-ink py-24 text-paper md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/table-lamps" className="hover:text-paper">{t(dict, "breadcrumb.products", "Table Lamps")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{headline}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">{headline}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">{intro}</p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-24">
        <RevealOnScroll className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-3 font-serif text-2xl font-light text-ink">
              {t(dict, "collectionLanding.storyHeading", "The Collection Story")}
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed text-ink/70">{story}</p>
          </div>
          <dl className="space-y-6 border-t border-ink/10 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "collectionLanding.designer", "Designer")}
              </dt>
              <dd className="mt-1 text-sm text-ink/75">{designer}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "collectionLanding.materials", "Materials")}
              </dt>
              <dd className="mt-1 text-sm text-ink/75">{materials}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "collectionLanding.dimensions", "Dimensions")}
              </dt>
              <dd className="mt-1 text-sm text-ink/75 font-feature-tabular">{dimensions}</dd>
            </div>
          </dl>
        </RevealOnScroll>
      </section>

      <section className="bg-paper-dim py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              {headline} {t(dict, "collectionLanding.lampsSuffix", "Lamps")}
            </h2>
            <TextLink href="/table-lamps">{t(dict, "collectionLanding.viewFullCollection", "View the Full Collection")}</TextLink>
          </RevealOnScroll>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.slug} product={product} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/60">
              {t(
                dict,
                "collectionLanding.comingSoon",
                "This collection's pieces are being prepared for their next run — in the meantime, see the"
              )}{" "}
              <Link href="/table-lamps" className="underline underline-offset-2 hover:text-gold-dark">
                {t(dict, "collectionLanding.fullCollection", "full collection")}
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="bg-ink py-20 text-center text-paper md:py-24">
        <RevealOnScroll className="mx-auto max-w-2xl px-6">
          <h2 className="font-serif text-3xl font-light md:text-4xl">
            {t(dict, "collectionLanding.commissioningHeading", "Commissioning a Piece")}
          </h2>
          <p className="mt-4 text-paper/60">
            {t(
              dict,
              "collectionLanding.commissioningBody",
              "For larger projects, bespoke colourways, or trade pricing, our team works directly with architects, designers, and private clients from first concept to installation."
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/consulting"
              className="inline-flex items-center gap-2.5 rounded-[3px] border border-paper bg-paper px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-gold hover:border-gold"
            >
              {t(dict, "collectionLanding.consultingAndProjects", "Consulting & Projects")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/contact"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-paper/70 transition-colors hover:text-paper"
            >
              {t(dict, "collectionLanding.contactDesignTeam", "Contact Our Design Team")}
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
