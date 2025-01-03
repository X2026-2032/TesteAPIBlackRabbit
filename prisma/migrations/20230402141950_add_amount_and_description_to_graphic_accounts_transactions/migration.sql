/*
  Warnings:

  - Added the required column `amount` to the `graphic_account_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction` to the `graphic_account_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "graphic_account_transactions" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "direction" TEXT NOT NULL;
