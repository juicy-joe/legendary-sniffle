import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { formatPrice } from "@/lib/format";

type OrderItem = { sku?: string; name: string; price: number; qty: number };

function parseOrderItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (i): i is OrderItem =>
      typeof i === "object" &&
      i !== null &&
      typeof (i as OrderItem).name === "string" &&
      typeof (i as OrderItem).price === "number" &&
      typeof (i as OrderItem).qty === "number"
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [
    productCount,
    collectionCount,
    categoryCount,
    enquiryCount,
    newOrderCount,
    designerCount,
    allOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.category.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.designer.count(),
    // The order table is the financial source of truth (per the site's own
    // tracking architecture — analytics platforms like GA4 are a
    // measurement layer, not this) — every revenue figure on this
    // dashboard is derived from it directly, not from any analytics tool.
    prisma.order.findMany({ select: { total: true, items: true } }),
  ]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = allOrders.length;
  const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  const revenueByProduct = new Map<string, { name: string; revenue: number; qty: number }>();
  for (const order of allOrders) {
    for (const item of parseOrderItems(order.items)) {
      const key = item.sku ?? item.name;
      const existing = revenueByProduct.get(key) ?? { name: item.name, revenue: 0, qty: 0 };
      existing.revenue += item.price * item.qty;
      existing.qty += item.qty;
      revenueByProduct.set(key, existing);
    }
  }
  const topProducts = Array.from(revenueByProduct.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Collections", value: collectionCount, href: "/admin/collections" },
    { label: "Categories", value: categoryCount, href: "/admin/categories" },
    { label: "Designers", value: designerCount, href: "/admin/designers" },
    { label: "New Enquiries", value: enquiryCount, href: "/admin/enquiries" },
    { label: "New Orders", value: newOrderCount, href: "/admin/orders" },
  ];

  const revenueStats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue) },
    { label: "Orders", value: String(orderCount) },
    { label: "Average Order Value", value: formatPrice(averageOrderValue) },
  ];

  return (
    <div>
      <p className="text-sm text-ink/65">
        Welcome back, {session?.name.split(" ")[0]}.
      </p>
      <h1 className="mt-1 font-serif text-3xl font-light text-ink">
        Dashboard
      </h1>

      <p className="mt-8 text-[11px] uppercase tracking-[0.14em] text-ink/50">Revenue</p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {revenueStats.map((s) => (
          <div key={s.label} className="rounded-[6px] border border-ink/10 bg-paper p-5">
            <p className="font-serif text-3xl text-gold-dark font-feature-tabular">{s.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/65">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[11px] uppercase tracking-[0.14em] text-ink/50">Catalog &amp; Activity</p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const card = (
            <div className="rounded-[6px] border border-ink/10 bg-paper p-5 transition-colors duration-300 hover:border-gold-dark/40">
              <p className="font-serif text-3xl text-gold-dark font-feature-tabular">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/65">
                {s.label}
              </p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {topProducts.length > 0 && (
        <>
          <p className="mt-10 text-[11px] uppercase tracking-[0.14em] text-ink/50">
            Top Products by Revenue
          </p>
          <div className="mt-3 overflow-x-auto rounded-[6px] border border-ink/10">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-paper-dim text-left text-[11px] uppercase tracking-[0.1em] text-ink/60">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 text-right font-medium">Units Sold</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map(([key, p]) => (
                  <tr key={key} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 text-ink/80">{p.name}</td>
                    <td className="px-4 py-3 text-right font-feature-tabular text-ink/70">{p.qty}</td>
                    <td className="px-4 py-3 text-right font-feature-tabular text-ink/80">
                      {formatPrice(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="mt-10 text-sm text-ink/65">
        For visitor/session/funnel-level analytics (traffic sources, conversion rate, cart
        abandonment), see GA4 once connected — this dashboard stays focused on what the order
        database itself can answer authoritatively: real revenue and real orders.
      </p>
    </div>
  );
}
