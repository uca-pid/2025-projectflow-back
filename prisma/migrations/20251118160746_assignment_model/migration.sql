/*
  Warnings:

  - You are about to drop the `_TaskAssignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_TaskAssignments" DROP CONSTRAINT "_TaskAssignments_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TaskAssignments" DROP CONSTRAINT "_TaskAssignments_B_fkey";

-- DropTable
DROP TABLE "public"."_TaskAssignments";

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "assignmentId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignmentId")
);

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
