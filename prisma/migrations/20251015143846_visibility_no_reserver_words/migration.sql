/*
  Warnings:

  - You are about to drop the column `public` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."task" DROP COLUMN "public",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
