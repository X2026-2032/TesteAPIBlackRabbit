/*
  Warnings:

  - The values [PRODUCT,SERVICE] on the enum `ChargeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `limit_date` on the `bank_slip` table. All the data in the column will be lost.
  - You are about to drop the column `payerId` on the `bank_slip` table. All the data in the column will be lost.
  - You are about to drop the `payer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tax` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `plans` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'CLOSE', 'DUE', 'PAID');

-- CreateEnum
CREATE TYPE "BankSlipStatus" AS ENUM ('OPEN', 'EXPIRED', 'PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "ChargeType_new" AS ENUM ('BANKSLIP', 'BANKSLIP_PIX');
ALTER TABLE "bank_slip" ALTER COLUMN "charge_type" TYPE "ChargeType_new" USING ("charge_type"::text::"ChargeType_new");
ALTER TYPE "ChargeType" RENAME TO "ChargeType_old";
ALTER TYPE "ChargeType_new" RENAME TO "ChargeType";
DROP TYPE "ChargeType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN_BAG';

-- DropForeignKey
ALTER TABLE "bank_slip" DROP CONSTRAINT "bank_slip_payerId_fkey";

-- DropForeignKey
ALTER TABLE "payer" DROP CONSTRAINT "payer_addressId_fkey";

-- DropForeignKey
ALTER TABLE "tax" DROP CONSTRAINT "tax_bankSlipId_fkey";

-- AlterTable
ALTER TABLE "accounts_transactions" ADD COLUMN     "newValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "previousValue" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "bank_slip" DROP COLUMN "limit_date",
DROP COLUMN "payerId",
ADD COLUMN     "correlationId" TEXT,
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "qrcode64" TEXT,
ADD COLUMN     "status" "BankSlipStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "graphic_account_transactions" ADD COLUMN     "correlationId" TEXT,
ADD COLUMN     "newValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "previousValue" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "avaliableToRoles" TEXT[];

-- DropTable
DROP TABLE "payer";

-- DropTable
DROP TABLE "tax";

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "recurrence" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "subscriptionId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
    "closeIn" TIMESTAMP(3) NOT NULL,
    "dueIn" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pag_bank_card_machine" (
    "id" TEXT NOT NULL,
    "serialNum" TEXT NOT NULL,
    "identificationCode" TEXT NOT NULL,
    "description" TEXT,
    "graphic_account_id" TEXT,
    "machinePlanId" TEXT NOT NULL,

    CONSTRAINT "pag_bank_card_machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pag_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "pag_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_configuration_pos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '1x',
    "tax" DOUBLE PRECISION DEFAULT 0,
    "installments" INTEGER NOT NULL DEFAULT 0,
    "pagPlansId" TEXT,

    CONSTRAINT "tax_configuration_pos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pag_bank_transactions_pos" (
    "id" TEXT NOT NULL,
    "movimento_api_codigo" TEXT NOT NULL,
    "tipo_registro" TEXT,
    "estabelecimento" TEXT,
    "data_inicial_transacao" TIMESTAMP(3),
    "hora_inicial_transacao" TEXT,
    "data_venda_ajuste" TIMESTAMP(3),
    "hora_venda_ajuste" TEXT,
    "tipo_evento" TEXT,
    "tipo_transacao" TEXT,
    "codigo_transacao" TEXT,
    "codigo_venda" TEXT,
    "valor_total_transacao" DOUBLE PRECISION,
    "valor_parcela" DOUBLE PRECISION,
    "pagamento_prazo" TEXT,
    "plano" TEXT,
    "parcela" TEXT,
    "quantidade_parcela" TEXT,
    "data_prevista_pagamento" TIMESTAMP(3),
    "taxa_parcela_comprador" DOUBLE PRECISION,
    "tarifa_boleto_compra" DOUBLE PRECISION,
    "valor_original_transacao" DOUBLE PRECISION,
    "taxa_parcela_vendedor" DOUBLE PRECISION,
    "taxa_intermediacao" DOUBLE PRECISION,
    "tarifa_intermediacao" DOUBLE PRECISION,
    "tarifa_boleto_vendedor" DOUBLE PRECISION,
    "taxa_rep_aplicacao" DOUBLE PRECISION,
    "valor_liquido_transacao" DOUBLE PRECISION,
    "status_pagamento" TEXT,
    "meio_pagamento" TEXT,
    "instituicao_financeira" TEXT,
    "canal_entrada" TEXT,
    "leitor" TEXT,
    "meio_captura" TEXT,
    "num_logico" TEXT,
    "nsu" TEXT,
    "cartao_bin" TEXT,
    "cartao_holder" TEXT,
    "codigo_autorizacao" TEXT,
    "codigo_cv" TEXT,
    "numero_serie_leitor" TEXT,
    "tx_id" TEXT,

    CONSTRAINT "pag_bank_transactions_pos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pag_bank_card_machine_serialNum_key" ON "pag_bank_card_machine"("serialNum");

-- CreateIndex
CREATE UNIQUE INDEX "pag_bank_card_machine_identificationCode_key" ON "pag_bank_card_machine"("identificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "pag_plans_name_key" ON "pag_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tax_configuration_pos_name_key" ON "tax_configuration_pos"("name");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pag_bank_card_machine" ADD CONSTRAINT "pag_bank_card_machine_graphic_account_id_fkey" FOREIGN KEY ("graphic_account_id") REFERENCES "graphic_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pag_bank_card_machine" ADD CONSTRAINT "pag_bank_card_machine_machinePlanId_fkey" FOREIGN KEY ("machinePlanId") REFERENCES "pag_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_configuration_pos" ADD CONSTRAINT "tax_configuration_pos_pagPlansId_fkey" FOREIGN KEY ("pagPlansId") REFERENCES "pag_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
