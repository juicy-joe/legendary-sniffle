import type { Metadata } from "next";
import RevealOnScroll from "@/components/RevealOnScroll";
import CheckoutFlow from "@/components/CheckoutFlow";
import { getShippingRates } from "@/lib/settings";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const locale = await getLocale();
  const [rates, dict] = await Promise.all([getShippingRates(), getUiTranslations(locale)]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
      <RevealOnScroll className="mb-12">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
          {t(dict, "checkoutPage.eyebrow", "Checkout")}
        </p>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">
          {t(dict, "checkoutPage.heading", "Complete Your Order")}
        </h1>
      </RevealOnScroll>

      <CheckoutFlow rates={rates} />
    </div>
  );
}
