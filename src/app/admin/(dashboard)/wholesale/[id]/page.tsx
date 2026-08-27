import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import WholesaleDiscountForm from "@/components/admin/WholesaleDiscountForm";
import WholesaleProductPriceForm from "@/components/admin/WholesaleProductPriceForm";
import { deleteWholesaleAccount } from "../actions";

export const metadata = { title: "Wholesale Account — Admin" };

export default async function WholesaleAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [account, products, settings] = await Promise.all([
    prisma.wholesaleAccount.findUnique({
      where: { id },
      include: {
        productPrices: { include: { product: { select: { name: true } } } },
        orders: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, orderNumber: true, total: true, createdAt: true } },
      },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getSettings(),
  ]);

  if (!account) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/wholesale" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Wholesale Accounts
      </Link>

      <div className="rounded-[6px] border border-ink/10 bg-paper p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-light text-ink">{account.businessName}</h1>
            <p className="mt-1 text-sm text-ink/70">{account.contactName}</p>
            <a href={`mailto:${account.email}`} className="text-sm text-gold-dark hover:underline">
              {account.email}
            </a>
            {account.phone && <p className="mt-1 text-sm text-ink/60">{account.phone}</p>}
            {account.vatId && <p className="text-sm text-ink/60">VAT: {account.vatId}</p>}
          </div>
          <DeleteEntityButton id={account.id} name={account.businessName} action={deleteWholesaleAccount} />
        </div>

        {account.notes && (
          <div className="mt-6 border-t border-ink/10 pt-6">
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Application Notes</p>
            <p className="text-sm leading-relaxed text-ink/70">{account.notes}</p>
          </div>
        )}

        <div className="mt-6 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Status</p>
          <span
            className={`inline-block rounded-[3px] px-2.5 py-1 text-xs font-medium ${
              account.status === "APPROVED"
                ? "bg-emerald-100 text-emerald-800"
                : account.status === "PENDING"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-ink/10 text-ink/60"
            }`}
          >
            {account.status}
          </span>
        </div>

        <div className="mt-6 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Discount</p>
          <WholesaleDiscountForm
            accountId={account.id}
            initialValue={account.discountPercent}
            defaultDiscount={settings.wholesaleDefaultDiscountPercent}
          />
        </div>

        <div className="mt-6 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Negotiated Product Prices
          </p>
          <WholesaleProductPriceForm
            accountId={account.id}
            products={products}
            overrides={account.productPrices.map((o) => ({
              id: o.id,
              productId: o.productId,
              productName: o.product.name,
              price: o.price,
            }))}
          />
        </div>

        <div className="mt-6 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Recent Orders</p>
          {account.orders.length === 0 ? (
            <p className="text-sm text-ink/60">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {account.orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="text-gold-dark hover:underline">
                    {o.orderNumber}
                  </Link>
                  <span className="text-ink/60">
                    €{o.total} &middot;{" "}
                    {o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
