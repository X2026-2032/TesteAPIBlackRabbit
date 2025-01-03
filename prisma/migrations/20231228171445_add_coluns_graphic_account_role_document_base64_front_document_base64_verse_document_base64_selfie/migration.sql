-- AlterTable
ALTER TABLE "graphic_accounts" ADD COLUMN     "document_base64_front" TEXT,
ADD COLUMN     "document_base64_selfie" TEXT,
ADD COLUMN     "document_base64_verse" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'WALLET';
