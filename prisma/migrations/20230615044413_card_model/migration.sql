-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('VIRTUAL', 'PHYSICAL');

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_id" TEXT,
    "tracking_code" TEXT,
    "type" "CardType" NOT NULL,
    "status" TEXT,
    "holder" TEXT,
    "issuer" TEXT,
    "number" TEXT,
    "is_noname" TEXT,
    "sub_status" TEXT,
    "expiration_date" TEXT,
    "estimated_delivery_date" TEXT,
    "issued_at" TEXT,
    "printed_at" TEXT,
    "expedited_at" TEXT,
    "delivered_at" TEXT,
    "limit_amount" TEXT,
    "limit_expires_at" TEXT,
    "limit_balance" TEXT,
    "bucket_id" TEXT,
    "tracking_url" TEXT,
    "reference_id" TEXT,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
