/*
  Warnings:

  - Added the required column `referenceId` to the `bank_slip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_slip" ADD COLUMN     "referenceId" TEXT NOT NULL;
