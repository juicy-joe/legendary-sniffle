-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "euRegularShippingPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "euExpressShippingPrice" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "nonEuRegularShippingPrice" INTEGER NOT NULL DEFAULT 450,
ADD COLUMN     "nonEuExpressShippingPrice" INTEGER NOT NULL DEFAULT 650;
