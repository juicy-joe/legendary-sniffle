import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWholesaleSession } from "@/lib/get-wholesale-session";
import { getApprovedWholesaleAccount, getWholesalePrices } from "@/lib/wholesale";
import { getShippingRates } from "@/lib/settings";
import TradePortal from "@/components/TradePortal";
import { wholesaleLogout } from "@/app/(site)/trade/login/actions";

export const metadata: Metadata = {
  title: "Trade Portal",
  robots: { index: false, follow: false },
};

export default async function TradePortalPage() {
  const session = await getWholesaleSession();
  // proxy.ts already guards this route, but a direct check here means the
  // page never renders with a null account even in a race between the
  // session expiring and the redirect happening.
  if (!session) redirect("/trade/login");

  const account = await getApprovedWholesaleAccount(session.sub);
  if (!account) redirect("/trade/login");

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, label: true } },
    },
  });

  const priceByProductId = await getWholesalePrices(account, products);
  const shippingRates = await getShippingRates();

  const items = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    retailPrice: p.price,
    wholesalePrice: priceByProductId.get(p.id) ?? p.price,
    image: p.images[0] ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold-dark">Trade Portal</p>
          <h1 className="font-serif text-3xl font-light text-ink md:text-4xl">
            Welcome, {account.businessName}
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {account.discountPercent != null
              ? `Your account discount: ${account.discountPercent}% off retail (with per-item pricing where negotiated).`
              : "Prices below reflect your trade account."}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/trade/portal/requests"
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-ink"
          >
            Special Order Requests
          </Link>
          <form action={wholesaleLogout}>
            <button
              type="submit"
              className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/50 transition-colors hover:text-ink"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>

      <TradePortal items={items} shippingRates={shippingRates} />
    </div>
  );
}
