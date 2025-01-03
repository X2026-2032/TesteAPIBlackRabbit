/*
  Warnings:

  - You are about to drop the `Plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxConfiguration` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "graphic_accounts" ADD COLUMN     "hash_reset_password" TEXT;

-- DropTable
DROP TABLE "Plans";

-- DropTable
DROP TABLE "TaxConfiguration";

-- CreateTable
CREATE TABLE "tax_configuration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscription_plan" TEXT DEFAULT 'none',
    "user_id" TEXT,
    "checkinTax" DOUBLE PRECISION DEFAULT 0,
    "checkoutTax" DOUBLE PRECISION DEFAULT 0,
    "checkinTaxType" TEXT DEFAULT 'NUMBER',
    "checkoutTaxType" TEXT DEFAULT 'NUMBER',

    CONSTRAINT "tax_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "subscribersIds" TEXT[],

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);
