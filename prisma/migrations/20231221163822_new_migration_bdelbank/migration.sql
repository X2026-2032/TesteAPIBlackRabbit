/*
  Warnings:

  - You are about to drop the column `city` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `occupation_id` on the `users` table. All the data in the column will be lost.
  - Added the required column `publicPlace` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `phone` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "city",
DROP COLUMN "postal_code",
DROP COLUMN "street",
ADD COLUMN     "cityId" INTEGER,
ADD COLUMN     "cityName" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicPlace" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "occupation_id",
DROP COLUMN "phone",
ADD COLUMN     "phone" JSONB NOT NULL;
