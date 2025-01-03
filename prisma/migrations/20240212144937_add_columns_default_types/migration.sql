-- AlterTable
ALTER TABLE "tax_configuration" ADD COLUMN     "checkinTaxDefaultType" TEXT DEFAULT 'NUMBER',
ADD COLUMN     "checkoutTaxDefaultType" TEXT DEFAULT 'NUMBER';
