/*
  Warnings:

  - The values [OBJECTIVE_COMPLETION] on the enum `AchievementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AchievementType_new" AS ENUM ('TASK_COMPLETION', 'TASK_REVIEW', 'TASK_ACCEPTED');
ALTER TABLE "public"."Achievement" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Achievement" ALTER COLUMN "type" TYPE "public"."AchievementType_new" USING ("type"::text::"public"."AchievementType_new");
ALTER TYPE "public"."AchievementType" RENAME TO "AchievementType_old";
ALTER TYPE "public"."AchievementType_new" RENAME TO "AchievementType";
DROP TYPE "public"."AchievementType_old";
ALTER TABLE "public"."Achievement" ALTER COLUMN "type" SET DEFAULT 'TASK_COMPLETION';
COMMIT;

-- AlterTable
ALTER TABLE "public"."UserStats" ADD COLUMN     "tasksAccepted" INTEGER NOT NULL DEFAULT 0;
