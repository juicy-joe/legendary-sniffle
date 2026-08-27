import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WholesaleApplicationActions from "@/components/admin/WholesaleApplicationActions";

export const metadata = { title: "Wholesale Accounts — Admin" };

export default async function AdminWholesalePage() {
  const accounts = await prisma.wholesaleAccount.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { orders: true } } },
  });

  const pending = accounts.filter((a) => a.status === "PENDING");
  const approved = accounts.filter((a) => a.status === "APPROVED");
  const rejected = accounts.filter((a) => a.status === "REJECTED");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Wholesale Accounts</h1>
        <p className="mt-1 text-sm text-ink/65">
          {accounts.length} total &middot; {pending.length} pending review
        </p>
      </div>

      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Pending Review</h2>
          <div className="overflow-x-auto rounded-[6px] border border-ink/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-paper-dim text-[11px] uppercase tracking-[0.1em] text-ink/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {pending.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-ink">{a.businessName}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {a.contactName} &middot; <a href={`mailto:${a.email}`} className="text-gold-dark hover:underline">{a.email}</a>
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {a.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <WholesaleApplicationActions id={a.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Approved</h2>
        {approved.length === 0 ? (
          <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-8 text-center text-sm text-ink/60">
            No approved accounts yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[6px] border border-ink/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-paper-dim text-[11px] uppercase tracking-[0.1em] text-ink/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {approved.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-ink">{a.businessName}</td>
                    <td className="px-4 py-3 text-ink/70">{a.contactName}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {a.discountPercent != null ? `${a.discountPercent}% (custom)` : "Default"}
                    </td>
                    <td className="px-4 py-3 font-feature-tabular text-ink/70">{a._count.orders}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/wholesale/${a.id}`} className="text-xs text-gold-dark hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Rejected</h2>
          <div className="overflow-x-auto rounded-[6px] border border-ink/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              <tbody className="divide-y divide-ink/10">
                {rejected.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-ink/60">{a.businessName}</td>
                    <td className="px-4 py-3 text-ink/50">{a.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
