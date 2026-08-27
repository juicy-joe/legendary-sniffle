import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CustomOrderStatusControl from "@/components/admin/CustomOrderStatusControl";

export const metadata = { title: "Custom Orders — Admin" };

const statusLabels: Record<string, string> = {
  QUOTED: "Quoted",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

export default async function CustomOrdersPage() {
  const orders = await prisma.customOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, sku: true } } },
  });

  return (
    <div>
      <Link href="/admin/warehouse" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Warehouse
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Custom Orders</h1>
          <p className="mt-1 text-sm text-ink/65">
            Commissioned production runs — quantity, customer, and status, kept separate from retail stock.
          </p>
        </div>
        <Link
          href="/admin/warehouse/custom-orders/new"
          className="flex items-center gap-1.5 rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
        >
          <Plus className="h-3.5 w-3.5" /> New Custom Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No custom orders yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-[6px] border border-ink/10 bg-paper p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink/60">
                    {o.customerName} ·{" "}
                    <a href={`mailto:${o.customerEmail}`} className="hover:underline">
                      {o.customerEmail}
                    </a>
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-ink">
                    <Link href={`/admin/warehouse/custom-orders/${o.id}`} className="hover:underline">
                      {o.product.name}
                    </Link>{" "}
                    <span className="text-base text-ink/50">&times; {o.quantity}</span>
                  </h2>
                  <p className="mt-1 text-xs text-ink/50 font-feature-tabular">{o.product.sku}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {o.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {o.targetCompletionDate
                      ? ` · Target ${o.targetCompletionDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : ""}
                  </p>
                </div>
                <CustomOrderStatusControl id={o.id} status={o.status} />
              </div>
              {o.notes && <p className="mt-4 text-sm leading-relaxed text-ink/80">{o.notes}</p>}
              <Link
                href={`/admin/warehouse/custom-orders/${o.id}`}
                className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.1em] text-gold-dark hover:underline"
              >
                {statusLabels[o.status]} — View details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
