/*
  Warnings:

  - You are about to drop the `pix_portability` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeSlip" AS ENUM ('CHARGE', 'DEPOSIT');

-- DropTable
DROP TABLE "pix_portability";
