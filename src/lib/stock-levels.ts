import { prisma } from "@/lib/prisma";

type OrderItem = { slug?: unknown; qty?: unknown };

function parseOrderItems(items: unknown): { slug: string; qty: number }[] {
  if (!Array.isArray(items)) return [];
  return (items as OrderItem[]).filter(
    (i): i is { slug: string; qty: number } => typeof i?.slug === "string" && typeof i?.qty === "number"
  );
}

export type StockLevel = {
  productId: string;
  onHand: number;
  reserved: number;
  available: number;
};

// Reserved and available are deliberately computed here, not stored columns
// on Product — "reserved" is just the stock already promised to an order
// that hasn't shipped yet (NEW/CONFIRMED/IN_PRODUCTION), and it's cheap to
// derive from the same Order rows that are already the source of truth for
// what's been sold. A stored column would just be a second place this
// number could drift from reality.
export async function getStockLevels(): Promise<Map<string, StockLevel>> {
  const [products, openOrders] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, stockQuantity: true } }),
    prisma.order.findMany({
      where: { status: { in: ["NEW", "CONFIRMED", "IN_PRODUCTION"] } },
      select: { items: true },
    }),
  ]);

  const reservedBySlug = new Map<string, number>();
  for (const order of openOrders) {
    for (const item of parseOrderItems(order.items)) {
      reservedBySlug.set(item.slug, (reservedBySlug.get(item.slug) ?? 0) + item.qty);
    }
  }

  const levels = new Map<string, StockLevel>();
  for (const p of products) {
    const reserved = reservedBySlug.get(p.slug) ?? 0;
    levels.set(p.id, {
      productId: p.id,
      onHand: p.stockQuantity,
      reserved,
      // Floored at 0 for display purposes — on-hand can legitimately read
      // lower than reserved (an order was confirmed before stock ran out,
      // e.g. a custom/pre-order situation), and "-3 available" would read
      // as a bug rather than the real signal that it needs attention.
      available: Math.max(0, p.stockQuantity - reserved),
    });
  }
  return levels;
}
