import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LampIllustration from "@/components/LampIllustration";
import ProductPhoto from "@/components/ProductPhoto";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getCatalog, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
import { jsonLdScriptProps } from "@/lib/json-ld";

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} by ${product.designer}`,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | SaFaLight`,
      description: product.description,
      type: "website",
      images: ["/opengraph-image"],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getProductBySlug(slug), getCatalog()]);
  if (!product) notFound();

  const related = getRelatedProducts(catalog, product);
  const editionNo = String(catalog.findIndex((p) => p.slug === product.slug) + 1).padStart(2, "0");

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
            { "@type": "ListItem", position: 3, name: product.name },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          brand: { "@type": "Brand", name: "SaFaLight" },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        })}
      />

      <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="hover:text-ink">Products</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
        <RevealOnScroll className="md:sticky md:top-28 md:self-start">
          <div className="relative aspect-[3/4] rounded-[6px] border border-ink/10 bg-paper-dim">
            {product.limited && (
              <span className="absolute left-6 top-6 z-10 border border-paper/40 bg-ink/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-paper backdrop-blur-sm">
                Limited Edition
              </span>
            )}
            <span className="absolute right-6 top-6 z-10 text-xs uppercase tracking-[0.14em] text-ink/65">
              No. {editionNo}
            </span>
            {product.images?.length ? (
              <ProductPhoto
                images={product.images}
                alt={`${product.name} by ${product.designer}`}
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-10">
                <LampIllustration product={product} className="h-full w-full" />
              </div>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">
            {product.collection}
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-ink">
            {product.name}
          </h1>
          <p className="mt-3 text-base text-ink/60">
            Designed by{" "}
            <span className="font-medium text-ink">{product.designer}</span>
          </p>

          <p className="mt-6 font-serif text-3xl text-gold-dark font-feature-tabular">
            ${product.price.toLocaleString()}
          </p>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
            {product.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-ink/10 py-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                Materials
              </dt>
              <dd className="mt-1 text-sm text-ink/75">{product.materials}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-ink/65">
                Dimensions
              </dt>
              <dd className="mt-1 text-sm text-ink/75 font-feature-tabular">
                {product.dimensions}
              </dd>
            </div>
          </dl>

          <blockquote className="mt-8 border-l border-gold pl-5 font-serif text-lg font-light leading-relaxed text-ink/70">
            &ldquo;{product.story}&rdquo;
          </blockquote>

          <div className="mt-10">
            <AddToCartPanel slug={product.slug} name={product.name} />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink/65">
            Made to order &middot; Average lead time 6&ndash;10 weeks &middot;
            White-glove delivery included &middot; Prefer to talk first?{" "}
            <Link href="/contact" className="text-ink/60 underline underline-offset-2 hover:text-gold-dark">
              Enquire with our design team
            </Link>
            .
          </p>
        </RevealOnScroll>
      </div>

      {related.length > 0 && (
        <section className="mt-28 border-t border-ink/10 pt-16">
          <RevealOnScroll className="mb-10">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              You May Also Admire
            </p>
            <h2 className="font-serif text-3xl text-ink">
              More from {product.designer}
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
