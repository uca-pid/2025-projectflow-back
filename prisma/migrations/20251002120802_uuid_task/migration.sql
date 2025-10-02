/*
  Warnings:

  - The primary key for the `_TaskApplications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_TaskAssignments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `task` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."_TaskApplications" DROP CONSTRAINT "_TaskApplications_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TaskAssignments" DROP CONSTRAINT "_TaskAssignments_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."task" DROP CONSTRAINT "task_parentTaskId_fkey";

-- AlterTable
ALTER TABLE "public"."_TaskApplications" DROP CONSTRAINT "_TaskApplications_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_TaskApplications_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."_TaskAssignments" DROP CONSTRAINT "_TaskAssignments_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_TaskAssignments_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."task" DROP CONSTRAINT "task_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parentTaskId" SET DATA TYPE TEXT,
ADD CONSTRAINT "task_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "task_id_seq";

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TaskApplications" ADD CONSTRAINT "_TaskApplications_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
