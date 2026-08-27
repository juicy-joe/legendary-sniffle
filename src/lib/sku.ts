import { prisma } from "@/lib/prisma";

/**
 * Generates the next permanent SKU for a product in the given category —
 * "<first 4 letters of the category name, uppercased>-<4-digit sequence>",
 * e.g. "GLAS-0013". The sequence is tracked per-prefix in SkuSequence via
 * an atomic upsert (INSERT ... ON CONFLICT ... RETURNING, in one round
 * trip so two products created at once can never collide) and only ever
 * increments, so a number is never reused even after every product that
 * had it is deleted. Mirrors the logic the initial backfill migration used.
 *
 * barcode is generated as the identical string, rendered as a Code
 * 128/QR label — see the doc comment on Product.barcode in schema.prisma
 * for why that's still a separate column rather than reusing sku directly.
 *
 * (prisma/seed.ts needs this same logic but runs with its own standalone
 * PrismaClient instance rather than this module's singleton, so it has a
 * small inlined copy of the query instead of importing this function.)
 */
export async function generateSku(categoryId: string): Promise<{ sku: string; barcode: string }> {
  const category = await prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    select: { name: true },
  });
  const prefix = category.name.slice(0, 4).toUpperCase();

  const rows = await prisma.$queryRaw<{ seq: number }[]>`
    INSERT INTO "SkuSequence" ("prefix", "nextValue")
    VALUES (${prefix}, 2)
    ON CONFLICT ("prefix") DO UPDATE SET "nextValue" = "SkuSequence"."nextValue" + 1
    RETURNING "nextValue" - 1 AS seq
  `;
  const code = `${prefix}-${String(rows[0].seq).padStart(4, "0")}`;
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
