/*
  Warnings:

  - You are about to alter the column `amount` on the `phone_recharges` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "phone_recharges" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
