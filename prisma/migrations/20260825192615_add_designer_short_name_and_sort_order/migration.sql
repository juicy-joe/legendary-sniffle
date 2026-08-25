-- AlterTable
ALTER TABLE "Designer" ADD COLUMN     "shortName" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
