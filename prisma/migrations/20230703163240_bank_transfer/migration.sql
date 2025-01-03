-- AlterTable
ALTER TABLE "bank_transfer" ADD COLUMN     "bank_account_bank" TEXT,
ADD COLUMN     "bank_account_branch" TEXT,
ADD COLUMN     "bank_account_digit" TEXT,
ADD COLUMN     "bank_account_document" TEXT,
ADD COLUMN     "bank_account_name" TEXT,
ADD COLUMN     "bank_account_number" TEXT;
