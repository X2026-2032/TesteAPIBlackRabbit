-- CreateTable
CREATE TABLE "bank_transfer" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "beneficiary_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "bank_transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_transfer" ADD CONSTRAINT "bank_transfer_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
