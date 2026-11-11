-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'CONVENTION_CENTER';

-- CreateIndex
CREATE INDEX "Venue_regionId_type_idx" ON "Venue"("regionId", "type");
