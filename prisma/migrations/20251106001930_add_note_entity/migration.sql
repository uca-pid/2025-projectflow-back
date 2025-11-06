-- CreateTable
CREATE TABLE "public"."note" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isPositive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."note" ADD CONSTRAINT "note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note" ADD CONSTRAINT "note_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
