/*
  Warnings:

  - Added the required column `referenceId` to the `bank_slip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_slip" ADD COLUMN     "referenceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "phone_recharges" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dealer_code" TEXT NOT NULL,
    "area_code" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" TEXT,
    "amounts" DOUBLE PRECISION[],

    CONSTRAINT "phone_recharges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "phone_recharges" ADD CONSTRAINT "phone_recharges_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
