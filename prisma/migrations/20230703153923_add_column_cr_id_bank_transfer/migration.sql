/*
  Warnings:

  - Added the required column `cr_transaction_id` to the `bank_transfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_transfer" ADD COLUMN     "cr_transaction_id" TEXT NOT NULL;
