-- AlterTable
ALTER TABLE "MeetingRequest" ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "boothId" TEXT,
ADD COLUMN     "location" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "requesterId" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MeetingRequest_requesterId_idx" ON "MeetingRequest"("requesterId");

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "BoothTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
