import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CustomOrderStatusControl from "@/components/admin/CustomOrderStatusControl";
import ReleaseSurplusForm from "@/components/admin/ReleaseSurplusForm";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import { deleteCustomOrder } from "../actions";

export const metadata = { title: "Custom Order — Admin" };

export default async function CustomOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.customOrder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true, slug: true, stockQuantity: true } },
      releasedToStock: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const totalReleased = order.releasedToStock.reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/warehouse/custom-orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Custom Orders
      </Link>

      <div className="rounded-[6px] border border-ink/10 bg-paper p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-light text-ink">
              <Link href={`/admin/products/${order.product.id}/edit`} className="hover:underline">
                {order.product.name}
              </Link>
            </h1>
            <p className="mt-1 text-sm text-ink/70 font-feature-tabular">{order.product.sku}</p>
            <p className="mt-2 text-sm text-ink/70">{order.customerName}</p>
            <a href={`mailto:${order.customerEmail}`} className="text-sm text-gold-dark hover:underline">
              {order.customerEmail}
            </a>
          </div>
          <DeleteEntityButton id={order.id} name={`${order.product.name} custom order`} action={deleteCustomOrder} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 border-y border-ink/10 py-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Quantity Commissioned</p>
            <p className="font-feature-tabular text-lg text-ink">{order.quantity}</p>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Target Completion</p>
            <p className="text-sm text-ink/80">
              {order.targetCompletionDate
                ? order.targetCompletionDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "Not set"}
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Notes</p>
            <p className="text-sm leading-relaxed text-ink/80">{order.notes}</p>
          </div>
        )}

        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Status</p>
          <CustomOrderStatusControl id={order.id} status={order.status} />
        </div>

        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="mb-1 text-[11px] uppercase tracking-[0.15em] text-ink/65">Release Surplus to Retail Stock</p>
          <p className="mb-4 text-xs text-ink/50">
            {order.product.name} is currently at {order.product.stockQuantity} on hand.
            {totalReleased > 0 ? ` ${totalReleased} unit${totalReleased === 1 ? "" : "s"} already released from this run.` : ""}
          </p>
          <ReleaseSurplusForm customOrderId={order.id} />
        </div>

        {order.releasedToStock.length > 0 && (
          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Movements From This Run</p>
            <ul className="space-y-2">
              {order.releasedToStock.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink/80">
                    {m.type === "IN" ? (
                      <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-700" />
                    ) : (
                      <ArrowUpFromLine className="h-3.5 w-3.5 text-ink/50" />
                    )}
                    {m.note || (m.type === "IN" ? "Surplus released" : "Adjustment")}
                  </span>
                  <span className="font-feature-tabular text-ink/70">
                    {m.type === "IN" ? "+" : "-"}
                    {m.quantity} ·{" "}
                    {m.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
