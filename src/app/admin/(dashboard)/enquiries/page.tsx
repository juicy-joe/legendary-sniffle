import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Enquiries — Admin" };

const statusStyles: Record<string, string> = {
  NEW: "bg-gold/15 text-gold-dark",
  READ: "bg-ink/10 text-ink/70",
  REPLIED: "bg-emerald-600/10 text-emerald-700",
};

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  const newCount = enquiries.filter((e) => e.status === "NEW").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Enquiries</h1>
        <p className="mt-1 text-sm text-ink/65">
          {enquiries.length} total
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gold-dark">
              {newCount} new
            </span>
          )}
        </p>
      </div>

      {enquiries.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No enquiries yet. Messages sent through the Contact page will show up here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-ink/10">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-warm/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/enquiries/${e.id}`} className="block">
                      <span className={e.status === "NEW" ? "font-semibold text-ink" : "font-medium text-ink"}>
                        {e.name}
                      </span>
                      <span className="block text-xs text-ink/60">{e.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{e.interest}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {e.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ${statusStyles[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
