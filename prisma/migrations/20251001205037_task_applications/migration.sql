-- CreateTable
CREATE TABLE "public"."_TaskApplications" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskApplications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskApplications_B_index" ON "public"."_TaskApplications"("B");

-- AddForeignKey
ALTER TABLE "public"."_TaskApplications" ADD CONSTRAINT "_TaskApplications_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TaskApplications" ADD CONSTRAINT "_TaskApplications_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
