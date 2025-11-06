-- AlterTable
ALTER TABLE "public"."task" ADD COLUMN     "completedById" TEXT;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
