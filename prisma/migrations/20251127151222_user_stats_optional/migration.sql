-- AlterTable
ALTER TABLE "public"."UserStats" ALTER COLUMN "tasksCreated" DROP NOT NULL,
ALTER COLUMN "tasksCompleted" DROP NOT NULL,
ALTER COLUMN "reviewsGiven" DROP NOT NULL;
