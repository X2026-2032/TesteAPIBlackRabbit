-- AlterTable
ALTER TABLE "graphic_accounts" ADD COLUMN     "planId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "planId" TEXT;

-- CreateTable
CREATE TABLE "TaxConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscription_plan" TEXT DEFAULT 'none',
    "user_id" TEXT,
    "checkinTax" DOUBLE PRECISION DEFAULT 0,
    "checkoutTax" DOUBLE PRECISION DEFAULT 0,
    "checkinTaxType" TEXT NOT NULL DEFAULT 'NUMBER',
    "checkoutTaxType" TEXT NOT NULL DEFAULT 'NUMBER',

    CONSTRAINT "TaxConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "subscribersIds" TEXT[],

    CONSTRAINT "Plans_pkey" PRIMARY KEY ("id")
);
