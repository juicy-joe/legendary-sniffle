-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "customOrderId" TEXT;

-- CreateIndex
CREATE INDEX "StockMovement_customOrderId_idx" ON "StockMovement"("customOrderId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
