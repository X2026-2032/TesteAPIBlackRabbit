/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PasswordReset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PasswordReset" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reference_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
