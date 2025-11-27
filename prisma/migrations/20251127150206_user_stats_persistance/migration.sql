-- CreateTable
CREATE TABLE "public"."UserStats" (
    "userId" TEXT NOT NULL,
    "tasksCreated" INTEGER NOT NULL,
    "tasksCompleted" INTEGER NOT NULL,
    "reviewsGiven" INTEGER NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "public"."UserStats"("userId");
