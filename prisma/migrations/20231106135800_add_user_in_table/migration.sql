-- AlterTable
ALTER TABLE "graphic_account_transactions" ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "graphic_account_transactions" ADD CONSTRAINT "graphic_account_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
