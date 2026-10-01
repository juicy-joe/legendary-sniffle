-- DropIndex
DROP INDEX "CustomOrder_orderId_idx";

-- DropIndex
DROP INDEX "CustomOrder_productId_idx";

-- DropIndex
DROP INDEX "CustomOrder_status_idx";

-- DropIndex
DROP INDEX "SpecialOrderRequest_wholesaleAccountId_idx";

-- DropIndex
DROP INDEX "StockMovement_customOrderId_idx";

-- DropIndex
DROP INDEX "StockMovement_orderId_idx";

-- DropIndex
DROP INDEX "StockMovement_productId_idx";

-- CreateTable
CREATE TABLE "ProductsContent" (
    "id" TEXT NOT NULL DEFAULT 'products',
    "heroEyebrow" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductsContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultingContent" (
    "id" TEXT NOT NULL DEFAULT 'consulting',
    "heroEyebrow" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "heroSubtext" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultingContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeContent" (
    "id" TEXT NOT NULL DEFAULT 'trade',
    "heroEyebrow" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "heroSubtext" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeContent_pkey" PRIMARY KEY ("id")
);
