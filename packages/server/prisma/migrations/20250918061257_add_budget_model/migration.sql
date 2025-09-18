/*
  Warnings:

  - You are about to drop the column `adults` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `kids` on the `Guest` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BudgetType" AS ENUM ('INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "public"."Guest" DROP COLUMN "adults",
DROP COLUMN "kids";

-- CreateTable
CREATE TABLE "public"."Budget" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "type" "public"."BudgetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Budget" ADD CONSTRAINT "Budget_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
