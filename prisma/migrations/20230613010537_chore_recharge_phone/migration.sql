/*
  Warnings:

  - You are about to drop the column `amounts` on the `phone_recharges` table. All the data in the column will be lost.
  - Changed the type of `dealer_code` on the `phone_recharges` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DealerCode" AS ENUM ('VIVO_01', 'CLARO_02', 'OI_03', 'TIM_04');

-- AlterTable
ALTER TABLE "phone_recharges" DROP COLUMN "amounts",
ADD COLUMN     "amount" DOUBLE PRECISION[],
ADD COLUMN     "pin" TEXT,
DROP COLUMN "dealer_code",
ADD COLUMN     "dealer_code" "DealerCode" NOT NULL;
