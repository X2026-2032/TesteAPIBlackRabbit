-- Migration simplificada e segura
CREATE TYPE "QrTokenStatus" AS ENUM ('PENDING', 'USED', 'EXPIRED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

CREATE TABLE "QrToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "QrTokenStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QrToken_token_key" ON "QrToken"("token");

ALTER TABLE "QrToken" ADD CONSTRAINT "QrToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;