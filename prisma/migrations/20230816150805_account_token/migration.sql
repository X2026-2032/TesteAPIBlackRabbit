/*
  Warnings:

  - You are about to drop the `account_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "account_transactions" DROP CONSTRAINT "account_transactions_account_id_fkey";

-- DropTable
DROP TABLE "account_transactions";

-- CreateTable
CREATE TABLE "accounts_transactions" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "response" JSONB,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "direction" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "accounts_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_users" (
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "accounts_token" (
    "access_token" TEXT NOT NULL,
    "account_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "account_users_user_id_key" ON "account_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_token_account_id_key" ON "accounts_token"("account_id");

-- AddForeignKey
ALTER TABLE "accounts_transactions" ADD CONSTRAINT "accounts_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_users" ADD CONSTRAINT "account_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_users" ADD CONSTRAINT "account_users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_token" ADD CONSTRAINT "accounts_token_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
