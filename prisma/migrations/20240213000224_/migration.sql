/*
  Warnings:

  - You are about to drop the column `checkinDefaultTax` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkinTax` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkinTaxDefaultType` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkinTaxType` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkoutDefaultTax` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkoutTax` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkoutTaxDefaultType` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `checkoutTaxType` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_plan` on the `tax_configuration` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tax_configuration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `tax_configuration` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tax_configuration" DROP COLUMN "checkinDefaultTax",
DROP COLUMN "checkinTax",
DROP COLUMN "checkinTaxDefaultType",
DROP COLUMN "checkinTaxType",
DROP COLUMN "checkoutDefaultTax",
DROP COLUMN "checkoutTax",
DROP COLUMN "checkoutTaxDefaultType",
DROP COLUMN "checkoutTaxType",
DROP COLUMN "subscription_plan",
DROP COLUMN "user_id",
ADD COLUMN     "tax" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "taxDefault" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "taxDefaultType" TEXT DEFAULT 'NUMBER',
ADD COLUMN     "taxType" TEXT DEFAULT 'NUMBER';

-- CreateIndex
CREATE UNIQUE INDEX "tax_configuration_name_key" ON "tax_configuration"("name");
