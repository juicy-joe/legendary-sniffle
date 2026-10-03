import { prisma } from "@/lib/prisma";

// Single store-wide prefix — every product gets "TL" + a 4-digit sequence
// regardless of category, e.g. "TL0013". Previously this was per-category
// ("GLAS-0013"); all 12 existing products were renumbered to TL0001-TL0012
// (Sunset first, as TL0001) in the same change that introduced this, and
// the SkuSequence("TL") row was seeded to continue from TL0013 — see
// scratch-images/renumber-skus.mjs in that commit for the one-time backfill.
const SKU_PREFIX = "TL";

/**
 * Generates the next permanent SKU for a newly created product —
 * "TL<4-digit sequence>". The sequence is tracked in SkuSequence via an
 * atomic upsert (INSERT ... ON CONFLICT ... RETURNING, in one round trip
 * so two products created at once can never collide) and only ever
 * increments, so a number is never reused even after every product that
 * had it is deleted.
 *
 * barcode is generated as the identical string, rendered as a Code
 * 128/QR label — see the doc comment on Product.barcode in schema.prisma
 * for why that's still a separate column rather than reusing sku directly.
 * (Product.gtin is the separate, genuine-identifier-only field — see its
 * own doc comment in schema.prisma.)
 *
 * (prisma/seed.ts needs this same logic but runs with its own standalone
 * PrismaClient instance rather than this module's singleton, so it has a
 * small inlined copy of the query instead of importing this function.)
 */
export async function generateSku(): Promise<{ sku: string; barcode: string }> {
  const rows = await prisma.$queryRaw<{ seq: number }[]>`
    INSERT INTO "SkuSequence" ("prefix", "nextValue")
    VALUES (${SKU_PREFIX}, 2)
    ON CONFLICT ("prefix") DO UPDATE SET "nextValue" = "SkuSequence"."nextValue" + 1
    RETURNING "nextValue" - 1 AS seq
  `;
  const code = `${SKU_PREFIX}${String(rows[0].seq).padStart(4, "0")}`;
  return { sku: code, barcode: code };
}

/**
 * Resolves a scanned or typed code to exactly one product — checks sku
 * first, then barcode (today they're always the same string since barcode
 * defaults to sku on creation, but this keeps working once a product gets
 * a real UPC/EAN in its barcode field instead). Case-insensitive and
 * trims whitespace, since both a camera scan and a keyboard-wedge scanner
 * can hand back stray whitespace or the wrong case.
 */
export async function findProductByCode(rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  return prisma.product.findFirst({
    where: { OR: [{ sku: { equals: code, mode: "insensitive" } }, { barcode: { equals: code, mode: "insensitive" } }] },
  });
}
