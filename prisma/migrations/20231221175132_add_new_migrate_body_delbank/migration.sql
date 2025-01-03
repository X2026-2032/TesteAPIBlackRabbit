/*
  Warnings:

  - You are about to drop the column `extra` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `monthly_invoicing` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "extra";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "monthly_invoicing" DOUBLE PRECISION NOT NULL;
