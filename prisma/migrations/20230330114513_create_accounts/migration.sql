/*
  Warnings:

  - Added the required column `refId` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "account_digit" TEXT,
ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "alias_status" TEXT,
ADD COLUMN     "branch_number" TEXT,
ADD COLUMN     "refId" TEXT NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;
