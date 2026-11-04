-- AlterTable
ALTER TABLE "MeetingRequest" ADD COLUMN     "outcome" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "rating" INTEGER;

-- AlterTable
ALTER TABLE "TicketTier" ADD COLUMN     "meetingQuota" INTEGER NOT NULL DEFAULT 0;
