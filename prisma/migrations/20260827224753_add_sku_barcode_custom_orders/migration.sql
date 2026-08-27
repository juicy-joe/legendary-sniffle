-- AlterTable: add sku/barcode as nullable first so we can backfill existing
-- rows before enforcing NOT NULL + UNIQUE below.
ALTER TABLE "Product" ADD COLUMN     "sku" TEXT;
ALTER TABLE "Product" ADD COLUMN     "barcode" TEXT;

-- CreateTable: per-prefix counters backing sku generation — persists across
-- deletions so a number is never reused.
CREATE TABLE "SkuSequence" (
    "prefix" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SkuSequence_pkey" PRIMARY KEY ("prefix")
);

-- Backfill: assign every existing product a SKU of
-- "<first 4 letters of its category name>-<zero-padded sequence>",
-- ordered by category then creation date, and seed SkuSequence so future
-- generation continues from the right number. barcode defaults to the
-- same string (see Product.barcode doc comment in schema.prisma).
DO $$
DECLARE
  prod RECORD;
  seq INTEGER;
BEGIN
  FOR prod IN
    SELECT p."id" AS id, UPPER(LEFT(c."name", 4)) AS prefix
    FROM "Product" p
    JOIN "Category" c ON c."id" = p."categoryId"
    ORDER BY c."name", p."createdAt"
  LOOP
    INSERT INTO "SkuSequence" ("prefix", "nextValue")
    VALUES (prod.prefix, 2)
    ON CONFLICT ("prefix") DO UPDATE SET "nextValue" = "SkuSequence"."nextValue" + 1
    RETURNING "nextValue" - 1 INTO seq;

    UPDATE "Product"
    SET "sku" = prod.prefix || '-' || LPAD(seq::TEXT, 4, '0'),
        "barcode" = prod.prefix || '-' || LPAD(seq::TEXT, 4, '0')
    WHERE "id" = prod.id;
  END LOOP;
END $$;

-- Enforce NOT NULL + UNIQUE now that every row has a value.
ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "barcode" SET NOT NULL;
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- Non-negative stock guard at the DB level — defense in depth beyond the
-- app-level logic (StockMovement is already the only path that changes
-- stockQuantity), so this can never go negative even via a bug or a future
-- direct DB write.
ALTER TABLE "Product" ADD CONSTRAINT "Product_stockQuantity_nonnegative" CHECK ("stockQuantity" >= 0);

-- CreateEnum
CREATE TYPE "CustomOrderStatus" AS ENUM ('QUOTED', 'CONFIRMED', 'IN_PRODUCTION', 'COMPLETED', 'DELIVERED');

-- CreateTable
CREATE TABLE "CustomOrder" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" "CustomOrderStatus" NOT NULL DEFAULT 'QUOTED',
    "targetCompletionDate" TIMESTAMP(3),
    "notes" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomOrder_productId_idx" ON "CustomOrder"("productId");

-- CreateIndex
CREATE INDEX "CustomOrder_orderId_idx" ON "CustomOrder"("orderId");

-- CreateIndex
CREATE INDEX "CustomOrder_status_idx" ON "CustomOrder"("status");

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
