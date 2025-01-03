-- AlterTable
ALTER TABLE "accounts_transactions" ADD COLUMN     "show_notification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "graphic_account_transactions" ADD COLUMN     "show_notification" BOOLEAN NOT NULL DEFAULT false;
