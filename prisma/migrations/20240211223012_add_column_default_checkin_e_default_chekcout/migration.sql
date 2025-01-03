-- AlterTable
ALTER TABLE "tax_configuration" ADD COLUMN     "checkinDefaultTax" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "checkoutDefaultTax" DOUBLE PRECISION DEFAULT 0;
