-- CreateEnum
CREATE TYPE "TypeRolePlans" AS ENUM ('MEMBERPJ', 'MEMBERPF', 'WALLET', 'GRAPHIC');

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "graphicId" TEXT;

-- AlterTable
ALTER TABLE "graphic_accounts" ADD COLUMN     "phone" JSONB;
