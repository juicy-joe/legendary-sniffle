// Server-side wholesale pricing logic — the one place that decides what a
// given account actually pays for a given product, so checkout and the
// trade portal can never disagree with each other about a price.
import "server-only";
import { prisma } from "./prisma";
import { getSettings } from "./settings";

export type WholesaleAccountSummary = {
  id: string;
  businessName: string;
  discountPercent: number | null;
};

/**
 * Resolves what `account` pays for `retailPrice`, in whole euros:
 * 1. A per-product negotiated override, if one's set for this account.
 * 2. Otherwise that account's own discountPercent, if set.
 * 3. Otherwise the site-wide default discount.
 */
export async function getWholesalePrice(
  account: WholesaleAccountSummary,
  productId: string,
  retailPrice: number
): Promise<number> {
  const override = await prisma.wholesaleProductPrice.findUnique({
    where: { wholesaleAccountId_productId: { wholesaleAccountId: account.id, productId } },
    select: { price: true },
  });
  if (override) return override.price;

  const discountPercent = account.discountPercent ?? (await getSettings()).wholesaleDefaultDiscountPercent;
  const discounted = Math.round(retailPrice * (1 - discountPercent / 100));
  return Math.max(discounted, 0);
}

/** Batch version for rendering a whole catalog page without N+1 queries. */
export async function getWholesalePrices(
  account: WholesaleAccountSummary,
  products: { id: string; price: number }[]
): Promise<Map<string, number>> {
  const overrides = await prisma.wholesaleProductPrice.findMany({
    where: { wholesaleAccountId: account.id, productId: { in: products.map((p) => p.id) } },
    select: { productId: true, price: true },
  });
  const overrideByProduct = new Map(overrides.map((o) => [o.productId, o.price]));
  const discountPercent = account.discountPercent ?? (await getSettings()).wholesaleDefaultDiscountPercent;

  const result = new Map<string, number>();
  for (const p of products) {
    const override = overrideByProduct.get(p.id);
    result.set(p.id, override ?? Math.max(Math.round(p.price * (1 - discountPercent / 100)), 0));
  }
  return result;
}

/** Only ever returns an APPROVED account — pending/rejected accounts can't price anything. */
export async function getApprovedWholesaleAccount(id: string): Promise<WholesaleAccountSummary | null> {
  const account = await prisma.wholesaleAccount.findUnique({
    where: { id },
    select: { id: true, businessName: true, discountPercent: true, status: true },
  });
  if (!account || account.status !== "APPROVED") return null;
  return account;
}
