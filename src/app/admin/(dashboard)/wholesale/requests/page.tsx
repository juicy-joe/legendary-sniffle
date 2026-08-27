import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import SpecialOrderRequestStatusControl from "@/components/admin/SpecialOrderRequestStatusControl";

export const metadata = { title: "Special Order Requests — Admin" };

export default async function AdminSpecialOrderRequestsPage() {
  const requests = await prisma.specialOrderRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { wholesaleAccount: { select: { id: true, businessName: true, contactName: true, email: true } } },
  });

  return (
    <div>
      <Link href="/admin/wholesale" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Wholesale Accounts
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Special Order Requests</h1>
        <p className="mt-1 text-sm text-ink/65">{requests.length} total</p>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No requests yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li key={r.id} className="rounded-[6px] border border-ink/10 bg-paper p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink/60">
                    <Link href={`/admin/wholesale/${r.wholesaleAccount.id}`} className="text-gold-dark hover:underline">
                      {r.wholesaleAccount.businessName}
                    </Link>
                    {" · "}
                    {r.wholesaleAccount.contactName}
                    {" · "}
                    <a href={`mailto:${r.wholesaleAccount.email}`} className="hover:underline">
                      {r.wholesaleAccount.email}
                    </a>
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-ink">{r.subject}</h2>
                  <p className="mt-1 text-xs text-ink/50">
                    {r.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    {r.quantity != null ? ` · Qty ${r.quantity}` : ""}
                  </p>
                </div>
                <SpecialOrderRequestStatusControl id={r.id} status={r.status} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/80">{r.message}</p>
              {r.fileUrl && (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-gold-dark hover:underline"
                >
                  📎 {r.fileName || "View attached file"}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
