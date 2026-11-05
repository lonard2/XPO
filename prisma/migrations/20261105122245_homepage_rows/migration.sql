-- CreateTable
CREATE TABLE "HomepageRow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleI18n" JSONB,
    "subtitle" TEXT,
    "subtitleI18n" JSONB,
    "regionId" TEXT,
    "position" INTEGER NOT NULL,
    "eventIdsJson" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageRow_regionId_position_idx" ON "HomepageRow"("regionId", "position");
