-- CreateTable
CREATE TABLE "DepositBankSlip" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "creatadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uptadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositBankSlip_pkey" PRIMARY KEY ("id")
);
