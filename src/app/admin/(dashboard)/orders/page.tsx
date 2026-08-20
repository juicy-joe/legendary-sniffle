import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Orders — Admin" };

const statusStyles: Record<string, string> = {
  NEW: "bg-gold/15 text-gold-dark",
  CONFIRMED: "bg-blue-500/10 text-blue-700",
  IN_PRODUCTION: "bg-amber-500/10 text-amber-700",
  SHIPPED: "bg-indigo-500/10 text-indigo-700",
  COMPLETED: "bg-emerald-600/10 text-emerald-700",
  CANCELLED: "bg-ink/10 text-ink/50",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  const newCount = orders.filter((o) => o.status === "NEW").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink/65">
          {orders.length} total
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gold-dark">
              {newCount} new
            </span>
          )}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No orders yet. Orders placed through Checkout will show up here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-ink/10">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-warm/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="block">
                      <span className="font-medium text-ink font-feature-tabular">{o.orderNumber}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ink/80">{o.customerName}</span>
                    <span className="block text-xs text-ink/60">{o.email}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/70 font-feature-tabular">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ${statusStyles[o.status]}`}>
                      {o.status.replace("_", " ")}
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
