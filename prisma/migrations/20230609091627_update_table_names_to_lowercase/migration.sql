/*
  Warnings:

  - You are about to drop the `BankSlip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tax` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BankSlip" DROP CONSTRAINT "BankSlip_payerId_fkey";

-- DropForeignKey
ALTER TABLE "Payer" DROP CONSTRAINT "Payer_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Tax" DROP CONSTRAINT "Tax_bankSlipId_fkey";

-- DropTable
DROP TABLE "BankSlip";

-- DropTable
DROP TABLE "Payer";

-- DropTable
DROP TABLE "Tax";

-- CreateTable
CREATE TABLE "bankSlip" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'charge',
    "charge_type" "ChargeType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "limit_date" "LimitDate" NOT NULL,
    "amount" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "payerId" TEXT,

    CONSTRAINT "bankSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax" (
    "id" TEXT NOT NULL,
    "kind" "TaxKind" NOT NULL,
    "type" "TaxType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bankSlipId" TEXT,

    CONSTRAINT "tax_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bankSlip" ADD CONSTRAINT "bankSlip_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payer" ADD CONSTRAINT "payer_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax" ADD CONSTRAINT "tax_bankSlipId_fkey" FOREIGN KEY ("bankSlipId") REFERENCES "bankSlip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
