/*
  Warnings:

  - Added the required column `status` to the `bank_transfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bank_transfer" ADD COLUMN     "status" TEXT NOT NULL;
