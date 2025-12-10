-- CreateEnum
CREATE TYPE "public"."Recurrence" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "public"."task" ADD COLUMN     "recurrenceExpiresAt" TIMESTAMP(3),
ADD COLUMN     "recurrenceType" "public"."Recurrence",
ADD COLUMN     "recurrences" INTEGER;
