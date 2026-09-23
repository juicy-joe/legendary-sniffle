import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Percent, ShieldCheck, Users } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import MagneticButton from "@/components/MagneticButton";
import { getSettings } from "@/lib/settings";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Trade Accounts",
  description: "Ollerialight trade accounts for retailers, designers, and hospitality buyers — wholesale pricing on the full collection.",
  alternates: { canonical: "/trade" },
};

export default async function TradePage() {
  const locale = await getLocale();
  const [settings, dict] = await Promise.all([getSettings(), getUiTranslations(locale)]);

  const perks = [
    {
      key: "tradePricing",
      icon: Percent,
      title: "Trade Pricing",
      body: t(
        dict,
        "trade.perk.tradePricing.body",
        "{percent}% off retail by default, with negotiated pricing available for regular volume."
      ).replace("{percent}", String(settings.wholesaleDefaultDiscountPercent)),
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
      <section className="bg-ink py-24 text-paper md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">{t(dict, "breadcrumb.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">{t(dict, "breadcrumb.trade", "Trade")}</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
              {t(dict, "trade.forTheTrade", "For the Trade")}
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              {t(dict, "trade.heroHeadline", "Wholesale Pricing for Retailers & Designers")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              {t(
                dict,
                "trade.heroSubtext",
                "A trade account gives you Ollerialight's full collection at wholesale pricing, direct access to our team for special orders, and a home for larger project requests."
              )}
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
