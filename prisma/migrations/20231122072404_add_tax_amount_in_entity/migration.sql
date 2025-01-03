-- CreateTable
CREATE TABLE "tx_amount_in" (
    "id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tx_amount_in_pkey" PRIMARY KEY ("id")
);
