-- CreateEnum
CREATE TYPE "public"."Period" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "public"."Objective" (
    "objectiveId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "objective" TEXT,
    "taskGoal" INTEGER NOT NULL DEFAULT 0,
    "period" "public"."Period" NOT NULL DEFAULT 'MONTH',

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("objectiveId")
);

-- AddForeignKey
ALTER TABLE "public"."Objective" ADD CONSTRAINT "Objective_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
