/*
  Warnings:

  - You are about to drop the `account_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "account_users" DROP CONSTRAINT "account_users_account_id_fkey";

-- DropForeignKey
ALTER TABLE "account_users" DROP CONSTRAINT "account_users_user_id_fkey";

-- DropTable
DROP TABLE "account_users";

-- CreateTable
CREATE TABLE "accounts_users" (
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_users_user_id_key" ON "accounts_users"("user_id");

-- AddForeignKey
ALTER TABLE "accounts_users" ADD CONSTRAINT "accounts_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_users" ADD CONSTRAINT "accounts_users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
