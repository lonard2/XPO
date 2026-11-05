-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "pageSize" TEXT,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "size" TEXT NOT NULL DEFAULT 'LARGE';
