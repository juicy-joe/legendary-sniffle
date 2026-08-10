import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [productCount, collectionCount, categoryCount, enquiryCount, orderCount, designerCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.collection.count(),
      prisma.category.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.designer.count(),
    ]);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Collections", value: collectionCount, href: "/admin/collections" },
    { label: "Categories", value: categoryCount, href: "/admin/categories" },
    { label: "Designers", value: designerCount, href: "/admin/designers" },
    { label: "New Enquiries", value: enquiryCount, href: "/admin/enquiries" },
    { label: "New Orders", value: orderCount, href: "/admin/orders" },
  ];

  return (
    <div>
      <p className="text-sm text-ink/65">
        Welcome back, {session?.name.split(" ")[0]}.
      </p>
      <h1 className="mt-1 font-serif text-3xl font-light text-ink">
        Dashboard
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
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

      <p className="mt-10 text-sm text-ink/65">
        More sections (Staff, Settings...) are being built out
        incrementally — this dashboard will grow with them.
      </p>
    </div>
  );
}
