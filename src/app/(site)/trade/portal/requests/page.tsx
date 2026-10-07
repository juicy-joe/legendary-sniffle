import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWholesaleSession } from "@/lib/get-wholesale-session";
import { getApprovedWholesaleAccount } from "@/lib/wholesale";
import SpecialOrderRequestForm from "@/components/SpecialOrderRequestForm";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Special Order Requests",
  robots: { index: false, follow: false },
};

export default async function TradeRequestsPage() {
  const session = await getWholesaleSession();
  if (!session) redirect("/trade/login");
  const account = await getApprovedWholesaleAccount(session.sub);
  if (!account) redirect("/trade/login");

  const locale = await getLocale();
  const [requests, dict] = await Promise.all([
    prisma.specialOrderRequest.findMany({
      where: { wholesaleAccountId: account.id },
      orderBy: { createdAt: "desc" },
    }),
    getUiTranslations(locale),
  ]);

  const statusLabels: Record<string, string> = {
    NEW: t(dict, "tradePortal.status.new", "New"),
    IN_REVIEW: t(dict, "tradePortal.status.inReview", "In Review"),
    RESPONDED: t(dict, "tradePortal.status.responded", "Responded"),
    CLOSED: t(dict, "tradePortal.status.closed", "Closed"),
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
      <Link href="/trade/portal" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> {t(dict, "tradePortal.backToCatalog", "Back to Catalog")}
      </Link>

      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold-dark">{t(dict, "tradePortal.heading", "Trade Portal")}</p>
      <h1 className="mb-3 font-serif text-3xl font-light text-ink md:text-4xl">
        {t(dict, "tradePortal.specialOrderRequests", "Special Order Requests")}
      </h1>
      <p className="mb-10 text-sm text-ink/60">
        {t(
          dict,
          "tradePortal.requestsIntro",
          "Need something outside the standard catalog — a custom finish, a bulk quote, a piece built from your own design? Tell us here and we'll follow up directly."
        )}
      </p>

      <div className="mb-12 rounded-[6px] border border-ink/10 bg-paper-dim p-6 md:p-8">
        <SpecialOrderRequestForm />
      </div>

      {requests.length > 0 && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-light text-ink">{t(dict, "tradePortal.pastRequests", "Your Past Requests")}</h2>
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="rounded-[6px] border border-ink/10 bg-paper p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{r.subject}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {r.quantity != null ? ` · Qty ${r.quantity}` : ""}
                    </p>
                  </div>
                  <span className="rounded-[3px] bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/70">
                    {statusLabels[r.status] ?? r.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink/70">{r.message}</p>
                {r.fileUrl && (
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs text-gold-dark hover:underline"
                  >
                    {r.fileName || t(dict, "tradePortal.viewAttachedFile", "View attached file")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
