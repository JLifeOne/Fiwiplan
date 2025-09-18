/*
  Warnings:

  - You are about to drop the column `geo` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `media` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `targets` on the `Ad` table. All the data in the column will be lost.
  - The `status` column on the `Ad` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Ad` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AdStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."Ad" DROP COLUMN "geo",
DROP COLUMN "media",
DROP COLUMN "targets",
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AdStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "public"."AdDemographics" (
    "adId" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "genders" "public"."Gender"[],
    "locations" TEXT[],
    "religions" TEXT[],
    "interests" TEXT[],

    CONSTRAINT "AdDemographics_pkey" PRIMARY KEY ("adId")
);

-- CreateTable
CREATE TABLE "public"."AdPayment" (
    "adId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdPayment_pkey" PRIMARY KEY ("adId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdPayment_transactionId_key" ON "public"."AdPayment"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."AdDemographics" ADD CONSTRAINT "AdDemographics_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdPayment" ADD CONSTRAINT "AdPayment_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
