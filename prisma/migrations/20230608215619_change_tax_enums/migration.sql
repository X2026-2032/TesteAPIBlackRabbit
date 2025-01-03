/*
  Warnings:

  - Changed the type of `kind` on the `Tax` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Tax` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TaxKind" AS ENUM ('FINE', 'INTEREST', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('PERCENTUAL', 'FIXED_AMOUNT');

-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "kind",
ADD COLUMN     "kind" "TaxKind" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TaxType" NOT NULL;

-- DropEnum
DROP TYPE "Kind";
