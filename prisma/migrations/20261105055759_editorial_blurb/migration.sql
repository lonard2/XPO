-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "editorialApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editorialBlurb" TEXT,
ADD COLUMN     "editorialBlurbI18n" JSONB;
