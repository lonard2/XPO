-- CreateTable
CREATE TABLE "EventUpdate" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageNewsSlot" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "HomepageNewsSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventUpdate_eventId_status_idx" ON "EventUpdate"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageNewsSlot_updateId_key" ON "HomepageNewsSlot"("updateId");

-- CreateIndex
CREATE INDEX "HomepageNewsSlot_regionId_idx" ON "HomepageNewsSlot"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageNewsSlot_regionId_position_key" ON "HomepageNewsSlot"("regionId", "position");

-- AddForeignKey
ALTER TABLE "EventUpdate" ADD CONSTRAINT "EventUpdate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageNewsSlot" ADD CONSTRAINT "HomepageNewsSlot_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "EventUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
