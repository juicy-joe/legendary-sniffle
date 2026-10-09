import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import LampIllustration from "@/components/LampIllustration";
import ProductPhoto from "@/components/ProductPhoto";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getCatalog, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getStockLevels } from "@/lib/stock-levels";
import { siteUrl } from "@/lib/site";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { formatPrice } from "@/lib/format";
import { getLocale, getUiTranslations, localeAlternates, t } from "@/lib/i18n";
import { productSeoTitle, productSeoDescription, productOgImage, productJsonLd, productPhotoAlt } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { collectionHref } from "@/lib/collection-links";
import { slugify } from "@/lib/slugify";
import TrackViewItem from "@/components/analytics/TrackViewItem";

export async function generateStaticParams() {
  // Only slugs are needed here, and getLocale() (the no-arg default) reads
  // cookies(), which isn't available at build time — pass a fixed locale to
  // skip that lookup entirely.
  const products = await getCatalog("en");
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings, locale] = await Promise.all([getProductBySlug(slug), getSettings(), getLocale()]);
  if (!product) return {};

  const title = productSeoTitle(product);
  const description = productSeoDescription(product, settings.siteName);
  const ogImage = productOgImage(product, settings.siteName);

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/products/${product.slug}`),
    openGraph: {
      title: `${product.name} | ${settings.siteName}`,
      description,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${settings.siteName}`,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const [product, catalog, dict, settings, stockLevels] = await Promise.all([
    getProductBySlug(slug),
    getCatalog(),
    getUiTranslations(locale),
    getSettings(),
    getStockLevels(),
  ]);
  if (!product) notFound();

  // Server-only, never passed to a Client Component — JSON-LD's
  // availability only ever needs in-stock/out-of-stock, never the number.
  const inStock = (stockLevels.get(product.id)?.available ?? 0) > 0;
  const related = getRelatedProducts(catalog, product);
  const editionNo = String(catalog.findIndex((p) => p.slug === product.slug) + 1).padStart(2, "0");

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
      <TrackViewItem product={product} />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${locale}` },
            { "@type": "ListItem", position: 2, name: "Table Lamps", item: `${siteUrl}/${locale}/table-lamps` },
            { "@type": "ListItem", position: 3, name: product.name },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps(productJsonLd(product, settings.siteName, inStock, locale))}
      />

      <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">{t(dict, "breadcrumb.home", "Home")}</Link>
        <span aria-hidden="true">/</span>
        <Link href="/table-lamps" className="hover:text-ink">{t(dict, "breadcrumb.products", "Table Lamps")}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
        <RevealOnScroll className="md:sticky md:top-28 md:self-start">
          <div className="relative rounded-[6px] border border-ink/10 bg-paper-dim">
            {product.limited && (
              <span className="absolute left-6 top-6 z-10 border border-paper/40 bg-ink/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-paper backdrop-blur-sm">
                {t(dict, "product.limitedEdition", "Limited Edition")}
              </span>
            )}
            <span className="absolute right-6 top-6 z-10 text-xs uppercase tracking-[0.14em] text-ink/65">
              {t(dict, "product.no", "No.")} {editionNo}
            </span>
            {product.images?.length ? (
              <ProductPhoto
                images={product.images}
                alt={productPhotoAlt(product)}
                priority
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center p-10">
                <LampIllustration product={product} className="h-full w-full" />
              </div>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          {(() => {
            const href = collectionHref(product.collection);
            return href ? (
              <Link
                href={href}
                className="text-xs uppercase tracking-[0.2em] text-gold-dark underline-offset-2 hover:underline"
              >
                {product.collection}
              </Link>
            ) : (
              <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">{product.collection}</p>
            );
          })()}
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-ink">
            {product.name}
          </h1>
          <p className="mt-3 text-base text-ink/60">
            {t(dict, "product.designedBy", "Designed by")}{" "}
            <Link href={`/designers/${slugify(product.designer)}`} className="font-medium text-ink hover:text-gold-dark">
              {product.designer}
            </Link>
          </p>

          <p className="mt-6 font-serif text-3xl text-gold-dark font-feature-tabular">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 max-w-lg whitespace-pre-line text-base leading-relaxed text-ink/70">
            {product.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-ink/10 py-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "product.materials", "Materials")}
              </dt>
              <dd className="mt-1 text-sm text-ink/75">{product.materials}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "product.dimensions", "Dimensions")}
              </dt>
              <dd className="mt-1 text-sm text-ink/75 font-feature-tabular">
                {product.dimensions}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "product.productId", "Product ID")}
              </dt>
              <dd className="mt-1 text-sm text-ink/75 font-feature-tabular">{product.sku}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                {t(dict, "product.specifications", "Specifications")}
              </dt>
              <dd className="mt-1 space-y-1 text-sm text-ink/75">
                <p>220&ndash;240V, E27 socket</p>
                <p>Dimmable</p>
                <p>Includes warm white light bulb</p>
              </dd>
            </div>
          </dl>

          {product.story && (
            <blockquote className="mt-8 border-l border-gold pl-5 font-serif text-lg font-light leading-relaxed text-ink/70">
              &ldquo;{product.story}&rdquo;
            </blockquote>
          )}

          <div className="mt-10">
            <AddToCartPanel slug={product.slug} name={product.name} />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink/65">
            {t(dict, "product.quickDelivery", "Quick delivery")} &middot;{" "}
            {t(dict, "product.whiteGlove", "White-glove delivery included")} &middot;{" "}
            {t(dict, "product.preferToTalk", "Prefer to talk first?")}{" "}
            <Link href="/contact" className="text-ink/60 underline underline-offset-2 hover:text-gold-dark">
              {t(dict, "product.enquireWithTeam", "Enquire with our design team")}
            </Link>
            .
          </p>
        </RevealOnScroll>
      </div>

      {related.length > 0 && (
        <section className="mt-28 border-t border-ink/10 pt-16">
          <RevealOnScroll className="mb-10">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              {t(dict, "product.alsoAdmire", "You May Also Admire")}
            </p>
            <h2 className="font-serif text-3xl text-ink">
              {t(dict, "product.moreFrom", "More from")} {product.designer}
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} listName="Related Products" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
