/*
  Warnings:

  - Made the column `tasksCreated` on table `UserStats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tasksCompleted` on table `UserStats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reviewsGiven` on table `UserStats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."UserStats" ALTER COLUMN "tasksCreated" SET NOT NULL,
ALTER COLUMN "tasksCreated" SET DEFAULT 0,
ALTER COLUMN "tasksCompleted" SET NOT NULL,
ALTER COLUMN "tasksCompleted" SET DEFAULT 0,
ALTER COLUMN "reviewsGiven" SET NOT NULL,
ALTER COLUMN "reviewsGiven" SET DEFAULT 0;
