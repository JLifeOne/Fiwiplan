/*
  Warnings:

  - You are about to drop the column `ctr` on the `AdStat` table. All the data in the column will be lost.
  - Added the required column `category` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategory` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Ad" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "public"."AdStat" DROP COLUMN "ctr",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "impressions" SET DEFAULT 0,
ALTER COLUMN "taps" SET DEFAULT 0,
ALTER COLUMN "saves" SET DEFAULT 0,
ALTER COLUMN "shares" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "address" TEXT,
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "subcategory" TEXT NOT NULL,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "public"."UserAdInteraction" (
    "userId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAdInteraction_pkey" PRIMARY KEY ("userId","adId")
);

-- CreateTable
CREATE TABLE "public"."AdReview" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdReview_adId_userId_key" ON "public"."AdReview"("adId", "userId");

-- AddForeignKey
ALTER TABLE "public"."UserAdInteraction" ADD CONSTRAINT "UserAdInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAdInteraction" ADD CONSTRAINT "UserAdInteraction_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdReview" ADD CONSTRAINT "AdReview_adId_fkey" FOREIGN KEY ("adId") REFERENCES "public"."Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdReview" ADD CONSTRAINT "AdReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
