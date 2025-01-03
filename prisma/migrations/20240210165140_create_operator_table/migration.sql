-- AlterEnum
ALTER TYPE "Type" ADD VALUE 'OPERATOR';

-- CreateTable
CREATE TABLE "operator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "function" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "Type" NOT NULL,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_email_key" ON "operator"("email");
