/*
  Warnings:

  - The `is_noname` column on the `cards` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "cards" DROP COLUMN "is_noname",
ADD COLUMN     "is_noname" BOOLEAN;
