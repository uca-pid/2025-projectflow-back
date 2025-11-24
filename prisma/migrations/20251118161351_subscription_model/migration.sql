/*
  Warnings:

  - You are about to drop the `_TaskTrackers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_TaskTrackers" DROP CONSTRAINT "_TaskTrackers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TaskTrackers" DROP CONSTRAINT "_TaskTrackers_B_fkey";

-- DropTable
DROP TABLE "public"."_TaskTrackers";

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscriptionId")
);

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
