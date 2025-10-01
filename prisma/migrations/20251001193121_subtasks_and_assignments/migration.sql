-- AlterTable
ALTER TABLE "public"."task" ADD COLUMN     "parentTaskId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
