-- AlterTable
ALTER TABLE "bank_transfer" ALTER COLUMN "beneficiary_name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "meta" DROP NOT NULL;
