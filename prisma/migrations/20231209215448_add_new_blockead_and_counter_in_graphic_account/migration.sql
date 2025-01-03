-- AlterTable
ALTER TABLE "graphic_accounts" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "counter" INTEGER NOT NULL DEFAULT 0;
