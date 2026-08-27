import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import LogStockMovementForm from "@/components/admin/LogStockMovementForm";
import StockThresholdInput from "@/components/admin/StockThresholdInput";

export const metadata = { title: "Warehouse — Admin" };

function stockStatus(quantity: number, threshold: number): { label: string; className: string } {
  if (quantity <= 0) return { label: "Out of Stock", className: "bg-red-100 text-red-800" };
  if (quantity <= threshold) return { label: "Low Stock", className: "bg-amber-100 text-amber-800" };
  return { label: "In Stock", className: "bg-emerald-100 text-emerald-800" };
}

export default async function WarehousePage() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        lowStockThreshold: true,
        collection: { select: { name: true } },
      },
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: { select: { name: true } }, order: { select: { orderNumber: true } } },
    }),
  ]);

  // Most-in-need-of-attention first — how far below (or above) its own
  // threshold each product sits, not just the raw quantity, since a
  // threshold of 10 vs. 2 makes the same stock count mean very different
  // things.
  const sortedProducts = [...products].sort(
    (a, b) => a.stockQuantity - a.lowStockThreshold - (b.stockQuantity - b.lowStockThreshold)
  );

  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">Warehouse</h1>
        <p className="mt-1 text-sm text-ink/65">Stock on hand, and every incoming or outgoing movement.</p>
      </div>

      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {outOfStockCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-[3px] bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800">
              <AlertTriangle className="h-3.5 w-3.5" /> {outOfStockCount} out of stock
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-[3px] bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" /> {lowStockCount} low on stock
            </span>
          )}
        </div>
      )}

      <div className="mb-8">
        <LogStockMovementForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
      </div>

      <div className="mb-10 overflow-x-auto rounded-[6px] border border-ink/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-paper-dim text-[11px] uppercase tracking-[0.1em] text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Low-Stock At</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {sortedProducts.map((p) => {
              const status = stockStatus(p.stockQuantity, p.lowStockThreshold);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink/70">{p.collection.name}</td>
                  <td className="px-4 py-3 font-feature-tabular text-ink">{p.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <StockThresholdInput productId={p.id} initialValue={p.lowStockThreshold} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-[3px] px-2.5 py-1 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 font-serif text-xl font-light text-ink">Recent Movements</h2>
      {movements.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No movements logged yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[6px] border border-ink/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink/10 bg-paper-dim text-[11px] uppercase tracking-[0.1em] text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Direction</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Supplier / Cost</th>
                <th className="px-4 py-3 font-medium">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                    {m.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-ink">{m.product.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`flex w-fit items-center gap-1 rounded-[3px] px-2 py-1 text-xs font-medium ${
                        m.type === "IN" ? "bg-emerald-100 text-emerald-800" : "bg-ink/10 text-ink/70"
                      }`}
                    >
                      {m.type === "IN" ? (
                        <ArrowDownToLine className="h-3 w-3" />
                      ) : (
                        <ArrowUpFromLine className="h-3 w-3" />
                      )}
                      {m.type === "IN" ? "In" : "Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-feature-tabular text-ink">{m.quantity}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {m.note || (m.order ? `Order ${m.order.orderNumber} shipped` : "—")}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {[m.supplier, m.unitCost != null ? formatPrice(m.unitCost) : null].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink/60">{m.loggedBy || (m.order ? "System" : "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
