import type { Metadata } from "next";
import Link from "next/link";
import WholesaleLoginForm from "@/components/WholesaleLoginForm";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Trade Login",
  robots: { index: false, follow: false },
};

export default async function TradeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const locale = await getLocale();
  const dict = await getUiTranslations(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-20 md:px-10">
      <p className="mb-2 text-center font-serif text-2xl font-light text-ink">
        {t(dict, "tradePortal.loginHeading", "Trade Login")}
      </p>
      <p className="mb-10 text-center text-sm text-ink/60">
        {t(dict, "tradePortal.loginSubtext", "Sign in to see your trade pricing.")}
      </p>
      <WholesaleLoginForm from={from} />
      <p className="mt-8 text-center text-sm text-ink/60">
        {t(dict, "tradePortal.noAccountQuestion", "Don't have a trade account?")}{" "}
        <Link href="/trade/apply" className="text-gold-dark hover:underline">
          {t(dict, "tradePortal.applyHere", "Apply here")}
        </Link>
      </p>
    </div>
  );
}
