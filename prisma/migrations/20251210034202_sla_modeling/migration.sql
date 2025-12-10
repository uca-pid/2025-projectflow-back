-- CreateEnum
CREATE TYPE "public"."SLA" AS ENUM ('CRITICAL', 'NORMAL');

-- AlterTable
ALTER TABLE "public"."task" ADD COLUMN     "sla" "public"."SLA",
ADD COLUMN     "slaStartedAt" TIMESTAMP(3);
