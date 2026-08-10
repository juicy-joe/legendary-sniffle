/*
  Warnings:

  - Added the required column `base` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `palette` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shade` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LampPalette" AS ENUM ('gold', 'ivory', 'onyx', 'bronze', 'smoke');

-- CreateEnum
CREATE TYPE "LampShade" AS ENUM ('dome', 'drum', 'cone', 'sphere', 'pleated');

-- CreateEnum
CREATE TYPE "LampBase" AS ENUM ('urn', 'column', 'sculpted', 'orb', 'disc');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "base" "LampBase" NOT NULL,
ADD COLUMN     "palette" "LampPalette" NOT NULL,
ADD COLUMN     "shade" "LampShade" NOT NULL;
