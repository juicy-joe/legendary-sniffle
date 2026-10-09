import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// Accepts an optional transaction client so createCheckoutSession can run
// this same computation *inside* the Serializable transaction that also
// inserts the new CheckoutHold — see that function for why the read and
// the write have to be atomic together, not just the write.
type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

type OrderItem = { slug?: unknown; qty?: unknown };

function parseOrderItems(items: unknown): { slug: string; qty: number }[] {
  if (!Array.isArray(items)) return [];
  return (items as OrderItem[]).filter(
    (i): i is { slug: string; qty: number } => typeof i?.slug === "string" && typeof i?.qty === "number"
  );
}

type HoldItem = { productId?: unknown; qty?: unknown };

function parseHoldItems(items: unknown): { productId: string; qty: number }[] {
  if (!Array.isArray(items)) return [];
  return (items as HoldItem[]).filter(
    (i): i is { productId: string; qty: number } => typeof i?.productId === "string" && typeof i?.qty === "number"
  );
}

export type StockLevel = {
  productId: string;
  onHand: number;
  reserved: number;
  available: number;
};

// Reserved and available are deliberately computed here, not stored columns
// on Product — "reserved" is stock already promised to an open order
// (NEW/CONFIRMED/IN_PRODUCTION) or to a checkout session that's been
// created but not yet paid/abandoned (see CheckoutHold's own doc comment
// for why that second category exists — without it, two people checking
// out the last unit at once could both succeed). Both are cheap to derive
// from rows that are already the source of truth for what's been sold or
// is in flight. A stored column would just be a second place this number
// could drift from reality.
export async function getStockLevels(client: PrismaClientOrTx = prisma): Promise<Map<string, StockLevel>> {
  const [products, openOrders, activeHolds] = await Promise.all([
    client.product.findMany({ select: { id: true, slug: true, stockQuantity: true } }),
    client.order.findMany({
      where: { status: { in: ["NEW", "CONFIRMED", "IN_PRODUCTION"] } },
      select: { items: true },
    }),
    client.checkoutHold.findMany({
      where: { expiresAt: { gt: new Date() } },
      select: { items: true },
    }),
  ]);

  // Opportunistic cleanup — not required for correctness (every read above
  // already filters expiresAt > now), just keeps the table from growing
  // forever. Fire-and-forget on the non-transactional path only: inside a
  // transaction this would count as a write against tables the transaction
  // didn't intend to touch, and could itself contend with the very holds
  // being inserted concurrently.
  if (client === prisma) {
    prisma.checkoutHold.deleteMany({ where: { expiresAt: { lte: new Date() } } }).catch(() => {});
  }

  const reservedByProductId = new Map<string, number>();
  const slugToId = new Map(products.map((p) => [p.slug, p.id]));
  for (const order of openOrders) {
    for (const item of parseOrderItems(order.items)) {
      const productId = slugToId.get(item.slug);
      if (!productId) continue; // product since renamed/deleted — nothing to reserve against
      reservedByProductId.set(productId, (reservedByProductId.get(productId) ?? 0) + item.qty);
    }
  }
  for (const hold of activeHolds) {
    for (const item of parseHoldItems(hold.items)) {
      reservedByProductId.set(item.productId, (reservedByProductId.get(item.productId) ?? 0) + item.qty);
    }
  }

  const levels = new Map<string, StockLevel>();
  for (const p of products) {
    const reserved = reservedByProductId.get(p.id) ?? 0;
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
