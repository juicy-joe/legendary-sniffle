-- CreateEnum
CREATE TYPE "WholesaleAccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "wholesaleDefaultDiscountPercent" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "wholesaleAccountId" TEXT;

-- CreateTable
CREATE TABLE "WholesaleAccount" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "vatId" TEXT,
    "notes" TEXT,
    "status" "WholesaleAccountStatus" NOT NULL DEFAULT 'PENDING',
    "passwordHash" TEXT,
    "discountPercent" INTEGER,
    "inviteToken" TEXT,
    "inviteTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesaleProductPrice" (
    "id" TEXT NOT NULL,
    "wholesaleAccountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "WholesaleProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleAccount_email_key" ON "WholesaleAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleAccount_inviteToken_key" ON "WholesaleAccount"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleProductPrice_wholesaleAccountId_productId_key" ON "WholesaleProductPrice"("wholesaleAccountId", "productId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_wholesaleAccountId_fkey" FOREIGN KEY ("wholesaleAccountId") REFERENCES "WholesaleAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleProductPrice" ADD CONSTRAINT "WholesaleProductPrice_wholesaleAccountId_fkey" FOREIGN KEY ("wholesaleAccountId") REFERENCES "WholesaleAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleProductPrice" ADD CONSTRAINT "WholesaleProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
