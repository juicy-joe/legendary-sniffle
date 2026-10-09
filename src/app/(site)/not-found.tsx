import Link from "@/components/Link";
import { ArrowRight } from "lucide-react";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getUiTranslations(locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-8xl font-light text-gold-gradient">404</p>
      <h1 className="mt-4 font-serif text-3xl font-light text-ink">
        {t(dict, "notFound.heading", "This Light Has Moved")}
      </h1>
      <p className="mt-3 text-ink/60">
        {t(
          dict,
          "notFound.body",
          "The page you're looking for doesn't exist, but our collection is still very much illuminated."
        )}
      </p>
      <Link
        href="/table-lamps"
        className="mt-8 inline-flex items-center gap-2.5 rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark"
      >
        {t(dict, "cart.browseCollection", "Browse the Collection")} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
