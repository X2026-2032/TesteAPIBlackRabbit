/*
  Warnings:

  - You are about to drop the column `referenceId` on the `phone_recharges` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "phone_recharges" DROP COLUMN "referenceId",
ADD COLUMN     "reference_id" TEXT;
