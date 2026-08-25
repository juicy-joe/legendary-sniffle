-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT,
ADD COLUMN     "shippedEmailSentAt" TIMESTAMP(3);
