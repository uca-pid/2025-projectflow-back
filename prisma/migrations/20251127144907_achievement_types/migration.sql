/*
  Warnings:

  - The primary key for the `Achievement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `achievementId` on the `UserAchievement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,achievementCode]` on the table `UserAchievement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `achievementCode` to the `UserAchievement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AchievementType" AS ENUM ('TASK_COMPLETION', 'TASK_REVIEW', 'OBJECTIVE_COMPLETION');

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropIndex
DROP INDEX "public"."UserAchievement_userId_achievementId_key";

-- AlterTable
ALTER TABLE "public"."Achievement" DROP CONSTRAINT "Achievement_pkey",
DROP COLUMN "id",
ADD COLUMN     "requiredObjectives" INTEGER,
ADD COLUMN     "requiredReviews" INTEGER,
ADD COLUMN     "requiredTasks" INTEGER,
ADD COLUMN     "type" "public"."AchievementType" NOT NULL DEFAULT 'TASK_COMPLETION',
ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "public"."UserAchievement" DROP COLUMN "achievementId",
ADD COLUMN     "achievementCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementCode_key" ON "public"."UserAchievement"("userId", "achievementCode");

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementCode_fkey" FOREIGN KEY ("achievementCode") REFERENCES "public"."Achievement"("code") ON DELETE CASCADE ON UPDATE CASCADE;
