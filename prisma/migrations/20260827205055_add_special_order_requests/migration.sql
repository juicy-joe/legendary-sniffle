-- CreateEnum
CREATE TYPE "SpecialOrderRequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'RESPONDED', 'CLOSED');

-- CreateTable
CREATE TABLE "SpecialOrderRequest" (
    "id" TEXT NOT NULL,
    "wholesaleAccountId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "quantity" INTEGER,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "status" "SpecialOrderRequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialOrderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpecialOrderRequest_wholesaleAccountId_idx" ON "SpecialOrderRequest"("wholesaleAccountId");

-- AddForeignKey
ALTER TABLE "SpecialOrderRequest" ADD CONSTRAINT "SpecialOrderRequest_wholesaleAccountId_fkey" FOREIGN KEY ("wholesaleAccountId") REFERENCES "WholesaleAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
