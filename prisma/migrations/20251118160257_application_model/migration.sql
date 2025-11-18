/*
  Warnings:

  - You are about to drop the `_TaskApplications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_TaskApplications" DROP CONSTRAINT "_TaskApplications_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TaskApplications" DROP CONSTRAINT "_TaskApplications_B_fkey";

-- DropTable
DROP TABLE "public"."_TaskApplications";

-- CreateTable
CREATE TABLE "public"."Application" (
    "applicationId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
