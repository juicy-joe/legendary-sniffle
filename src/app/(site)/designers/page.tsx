import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getDesigners } from "@/lib/catalog";
import { slugify } from "@/lib/slugify";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Designers",
  description:
    "Meet the designers behind Ollerialight's hand-blown glass table lamps, from design philosophy to the collections they've created.",
  alternates: { canonical: "/designers" },
};

export default async function DesignersPage() {
  const locale = await getLocale();
  const [designers, dict] = await Promise.all([getDesigners(), getUiTranslations(locale)]);

  return (
    <div>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Designers" },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: designers.map((d, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: d.shortName || d.name,
              description: d.bio,
              url: `${siteUrl}/designers/${slugify(d.shortName || d.name)}`,
            },
          })),
        })}
      />
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{t(dict, "breadcrumb.designers", "Designers")}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              {t(dict, "designers.heroEyebrow", "The Atelier")}
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              {t(dict, "designers.heroHeading", "Our Designers")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              {t(
                dict,
                "designers.heroSubtext",
                "Every Ollerialight table lamp begins with a designer's own hand — here's who shapes our collections."
              )}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {designers.map((d, i) => (
            <RevealOnScroll key={d.id} delay={i * 0.06}>
              <Link
                href={`/designers/${slugify(d.shortName || d.name)}`}
                className="group block rounded-[6px] border border-ink/10 bg-paper p-8 transition-colors duration-300 hover:border-gold-dark/40"
              >
                <p className="text-[11px] uppercase tracking-[0.15em] text-ink/65">{d.origin}</p>
                <h2 className="mt-2 font-serif text-2xl text-ink group-hover:text-gold-dark">
                  {d.shortName || d.name}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/60">{d.bio}</p>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
