import type { Metadata } from "next";
import Link from "@/components/Link";
import { ArrowRight, Gem, Hammer, Leaf, Sparkles } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import MagneticButton from "@/components/MagneticButton";
import { getDesigners } from "@/lib/catalog";
import { getAboutContent } from "@/lib/content";
import { getLocale, getUiTranslations, localeAlternates, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";
import { slugify } from "@/lib/slugify";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "About Us",
    description:
      "Ollerialight was founded to give master lighting designers a home. Learn our story, meet our resident designers, and see how every lamp is made.",
    alternates: localeAlternates(locale, "/about"),
  };
}

const values = [
  {
    key: "madeByHand",
    icon: Hammer,
    title: "Made by Hand",
    body: "Mouth-blown by master artisans, each sphere individually shaped and hand-polished.",
  },
  {
    key: "premiumMaterials",
    icon: Gem,
    title: "Premium Raw Materials",
    body: "Our proprietary, lead-free optical crystalline glass composition guarantees exceptional hardness, brilliant light refraction, and a luminous, jewel-like sheen, developed specifically for sculptural lighting.",
  },
  {
    key: "madeToLast",
    icon: Leaf,
    title: "Made to Last",
    body: "Every lamp is designed to be repaired, rewired, and passed down — not replaced.",
  },
  {
    key: "limitedEditions",
    icon: Sparkles,
    title: "Limited Editions",
    body: "Produced in small series with meticulous attention to detail — no design is ever made more than 100 times.",
  },
];

export default async function AboutPage() {
  const locale = await getLocale();
  const [designers, content, dict] = await Promise.all([
    getDesigners(),
    getAboutContent(),
    getUiTranslations(locale),
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${locale}` },
            { "@type": "ListItem", position: 2, name: "About Us" },
          ],
        })}
      />
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{t(dict, "breadcrumb.about", "About Us")}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              {t(dict, "about.ourStory", "Our Story")}
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              {content.heroHeadline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              {content.heroSubtext}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <RevealOnScroll className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
            {t(dict, "about.theAtelier", "The Atelier")}
          </p>
          <h2 className="font-serif text-4xl font-light text-ink md:text-5xl">
            {t(dict, "about.residentDesigners", "Our Resident Designers")}
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {designers.map((d, i) => (
            <RevealOnScroll
              key={d.name}
              delay={i * 0.06}
              className="rounded-[6px] border border-ink/10 bg-paper p-8 transition-colors duration-300 hover:border-gold-dark/40"
            >
              <p className="text-[11px] uppercase tracking-[0.15em] text-ink/65">
                {d.origin}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-ink">
                <Link href={`/designers/${slugify(d.shortName || d.name)}`} className="hover:text-gold-dark">
                  {d.name}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {d.bio}
              </p>
              <Link
                href={`/designers/${slugify(d.shortName || d.name)}`}
                className="mt-3 inline-block text-[11px] font-medium uppercase tracking-[0.14em] text-gold-dark hover:underline"
              >
                View Their Table Lamps
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <RevealOnScroll className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
            {t(dict, "about.whatWeStandFor", "What We Stand For")}
          </p>
          <h2 className="font-serif text-4xl font-light text-ink md:text-5xl">
            {t(dict, "about.valuesHeading", "Values We Do Not Compromise On")}
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <RevealOnScroll key={v.key} delay={i * 0.06} className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-dark/40 text-gold-dark">
                <v.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-ink">{t(dict, `about.value.${v.key}.title`, v.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {t(dict, `about.value.${v.key}.body`, v.body)}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-center text-paper">
        <RevealOnScroll className="mx-auto max-w-2xl px-6">
          <h2 className="font-serif text-4xl font-light md:text-5xl">
            {t(dict, "about.readyToFind", "Ready to Find Your Piece?")}
          </h2>
          <p className="mt-4 text-paper/60">
            {t(
              dict,
              "about.ctaBlurb",
              "Speak with our design team about a commission, a specific finish, or a piece for a space you love."
            )}
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton href="/contact" variant="paper">
              {t(dict, "about.bookConsultation", "Book a Consultation")} <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>
          <Link
            href="/table-lamps"
            className="mt-6 inline-block text-sm text-paper/60 underline underline-offset-2 transition-colors hover:text-paper"
          >
            {t(dict, "about.orBrowseCollection", "Or browse the full collection of designer table lamps")}
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}
