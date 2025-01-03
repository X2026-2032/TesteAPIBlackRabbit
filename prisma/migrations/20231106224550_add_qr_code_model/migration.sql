-- CreateTable
CREATE TABLE "id_tx_transactions_qrcode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response_tx_id" TEXT,

    CONSTRAINT "id_tx_transactions_qrcode_pkey" PRIMARY KEY ("id")
);
