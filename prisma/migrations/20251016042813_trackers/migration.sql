-- CreateTable
CREATE TABLE "public"."_TaskTrackers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskTrackers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskTrackers_B_index" ON "public"."_TaskTrackers"("B");

-- AddForeignKey
ALTER TABLE "public"."_TaskTrackers" ADD CONSTRAINT "_TaskTrackers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TaskTrackers" ADD CONSTRAINT "_TaskTrackers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
