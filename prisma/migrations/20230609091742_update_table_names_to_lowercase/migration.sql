/*
  Warnings:

  - You are about to drop the `DepositBankSlip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bankSlip` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bankSlip" DROP CONSTRAINT "bankSlip_payerId_fkey";

-- DropForeignKey
ALTER TABLE "tax" DROP CONSTRAINT "tax_bankSlipId_fkey";

-- DropTable
DROP TABLE "DepositBankSlip";

-- DropTable
DROP TABLE "bankSlip";

-- CreateTable
CREATE TABLE "deposit_bank_slip" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "creatadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uptadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposit_bank_slip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_slip" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'charge',
    "charge_type" "ChargeType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "limit_date" "LimitDate" NOT NULL,
    "amount" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "payerId" TEXT,

    CONSTRAINT "bank_slip_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_slip" ADD CONSTRAINT "bank_slip_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax" ADD CONSTRAINT "tax_bankSlipId_fkey" FOREIGN KEY ("bankSlipId") REFERENCES "bank_slip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
