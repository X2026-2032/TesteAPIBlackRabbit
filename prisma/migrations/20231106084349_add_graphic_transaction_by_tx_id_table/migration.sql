-- CreateTable
CREATE TABLE "graphic_idtx_transactions" (
    "id" TEXT NOT NULL,
    "transaction_idtx" TEXT,
    "id_user_graphic" TEXT NOT NULL,
    "my_graphic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "graphic_idtx_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "graphic_idtx_transactions" ADD CONSTRAINT "graphic_idtx_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "graphic_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
