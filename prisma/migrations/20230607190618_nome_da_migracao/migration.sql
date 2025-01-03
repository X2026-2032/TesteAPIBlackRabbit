-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "LimitDate" AS ENUM ('D30', 'D60', 'D90');

-- CreateEnum
CREATE TYPE "PayerDocument" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "Kind" AS ENUM ('PERCENTUAL', 'FIXED_AMOUNT');

-- CreateTable
CREATE TABLE "BankSlip" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'charge',
    "charge_type" "ChargeType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "limit_date" "LimitDate" NOT NULL,
    "amount" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "payerId" TEXT,

    CONSTRAINT "BankSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" "PayerDocument" NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "Payer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" TEXT NOT NULL,
    "kind" "Kind" NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bankSlipId" TEXT,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankSlip" ADD CONSTRAINT "BankSlip_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_bankSlipId_fkey" FOREIGN KEY ("bankSlipId") REFERENCES "BankSlip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
