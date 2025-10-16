/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_invitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."notification" DROP CONSTRAINT "notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."task_invitation" DROP CONSTRAINT "task_invitation_invitedUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."task_invitation" DROP CONSTRAINT "task_invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."task_invitation" DROP CONSTRAINT "task_invitation_taskId_fkey";

-- DropTable
DROP TABLE "public"."notification";

-- DropTable
DROP TABLE "public"."task_invitation";

-- DropEnum
DROP TYPE "public"."InvitationStatus";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "invitationId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "invitedId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("invitationId")
);

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
