-- CreateTable
CREATE TABLE "graphic_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "graphic_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graphic_account_transactions" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "response" JSONB,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "graphic_account_id" TEXT,

    CONSTRAINT "graphic_account_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "graphic_accounts_document_key" ON "graphic_accounts"("document");

-- CreateIndex
CREATE UNIQUE INDEX "graphic_accounts_email_key" ON "graphic_accounts"("email");

-- AddForeignKey
ALTER TABLE "graphic_accounts" ADD CONSTRAINT "graphic_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graphic_accounts" ADD CONSTRAINT "graphic_accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graphic_account_transactions" ADD CONSTRAINT "graphic_account_transactions_graphic_account_id_fkey" FOREIGN KEY ("graphic_account_id") REFERENCES "graphic_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
