-- AlterTable
ALTER TABLE "Product" ADD COLUMN "gtin" TEXT,
ADD COLUMN "amazonSku" TEXT,
ADD COLUMN "asin" TEXT,
ADD COLUMN "fnsku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_gtin_key" ON "Product"("gtin");

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "attribution" JSONB;
