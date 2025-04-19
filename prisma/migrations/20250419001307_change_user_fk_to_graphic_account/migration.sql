-- Adiciona a nova coluna
ALTER TABLE "QrToken" ADD COLUMN     "graphicAccountId" TEXT;

-- Remove a FK antiga (se aplicável)
ALTER TABLE "QrToken" DROP CONSTRAINT "QrToken_userId_fkey";

-- Cria a FK nova
ALTER TABLE "QrToken" ADD CONSTRAINT "QrToken_graphicAccountId_fkey" FOREIGN KEY ("graphicAccountId") REFERENCES "graphic_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove a coluna antiga (se removida do schema)
ALTER TABLE "QrToken" DROP COLUMN "userId";
