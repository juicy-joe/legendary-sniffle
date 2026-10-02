import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Percent, ShieldCheck, Users } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import MagneticButton from "@/components/MagneticButton";
import { getTradeContent } from "@/lib/content";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trade Accounts",
  description: "Ollerialight trade accounts for retailers, designers, and hospitality buyers — wholesale pricing on the full collection.",
  alternates: { canonical: "/trade" },
};

export default async function TradePage() {
  const locale = await getLocale();
  const [content, dict] = await Promise.all([getTradeContent(), getUiTranslations(locale)]);

  const perks = [
    {
      key: "tradePricing",
      icon: Percent,
      title: "Trade Pricing",
      body: t(
        dict,
        "trade.perk.tradePricing.body",
        "Log in to view our exclusive retailer prices. For larger quantities or customised projects, individual pricing and special conditions may be available upon request."
      ),
    },
    {
      key: "dedicatedContact",
      icon: Users,
      title: "A Dedicated Contact",
      body: t(
        dict,
        "trade.perk.dedicatedContact.body",
        "Work directly with our team on special orders, custom finishes, and larger project needs."
      ),
    },
    {
      key: "reviewedNotAutomated",
      icon: ShieldCheck,
      title: "Reviewed, Not Automated",
      body: t(
        dict,
        "trade.perk.reviewedNotAutomated.body",
        "Every trade account is approved personally — pricing stays protected for genuine trade partners."
      ),
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "B2B" },
          ],
        })}
      />
      <section className="bg-ink py-24 text-paper md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{t(dict, "breadcrumb.trade", "B2B")}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
              {content.heroEyebrow}
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              {content.heroHeadline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              {content.heroSubtext}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton href="/trade/apply" variant="paper">
                {t(dict, "trade.applyButton", "Apply for a Trade Account")} <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
              <Link
                href="/trade/login"
                className="text-[11px] font-medium uppercase tracking-[0.16em] text-paper/70 transition-colors hover:text-paper"
              >
                {t(dict, "trade.alreadyHaveAccount", "Already have an account? Log in")}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {perks.map((p, i) => (
            <RevealOnScroll key={p.key} delay={i * 0.06} className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-dark/40 text-gold-dark">
                <p.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-ink">{t(dict, `trade.perk.${p.key}.title`, p.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{p.body}</p>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
