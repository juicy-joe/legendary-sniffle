import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductCard from "@/components/ProductCard";
import { getCatalog, getDesigners } from "@/lib/catalog";
import { slugify } from "@/lib/slugify";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";
import { getSettings } from "@/lib/settings";

export async function generateStaticParams() {
  const designers = await getDesigners("en");
  return designers.map((d) => ({ slug: slugify(d.shortName || d.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const designers = await getDesigners("en");
  const designer = designers.find((d) => slugify(d.shortName || d.name) === slug);
  if (!designer) return {};

  const name = designer.shortName || designer.name;
  return {
    title: name,
    description: `${name}, ${designer.origin} — designer of Ollerialight's hand-blown glass table lamps. ${designer.bio}`.slice(0, 160),
    alternates: { canonical: `/designers/${slug}` },
  };
}

export default async function DesignerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const [designers, catalog, settings, dict] = await Promise.all([
    getDesigners(),
    getCatalog(),
    getSettings(),
    getUiTranslations(locale),
  ]);
  const designer = designers.find((d) => slugify(d.shortName || d.name) === slug);
  if (!designer) notFound();

  const name = designer.shortName || designer.name;
  const products = catalog.filter((p) => p.designer === name);

  return (
    <div>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Designers", item: `${siteUrl}/designers` },
            { "@type": "ListItem", position: 3, name },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "Person",
          name,
          description: designer.bio,
          url: `${siteUrl}/designers/${slug}`,
          worksFor: { "@type": "Organization", name: settings.siteName, url: siteUrl },
        })}
      />
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/designers" className="hover:text-paper">Designers</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{name}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">{designer.origin}</p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">{name}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">{designer.bio}</p>
          </RevealOnScroll>
        </div>
      </section>

      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
          <RevealOnScroll className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="font-serif text-3xl text-ink md:text-4xl">
              Table Lamps by {name}
            </h2>
            <Link
              href="/table-lamps"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-gold-dark"
            >
              View All Table Lamps
            </Link>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
