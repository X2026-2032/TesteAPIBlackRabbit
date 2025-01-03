-- AlterTable
ALTER TABLE "graphic_accounts" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "id_master_user" TEXT,
ADD COLUMN     "status_master_user" BOOLEAN NOT NULL DEFAULT false;
