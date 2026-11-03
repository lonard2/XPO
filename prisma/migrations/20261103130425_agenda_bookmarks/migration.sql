-- CreateTable
CREATE TABLE "AgendaBookmark" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "agendaItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgendaBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgendaBookmark_bookingId_idx" ON "AgendaBookmark"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaBookmark_bookingId_agendaItemId_key" ON "AgendaBookmark"("bookingId", "agendaItemId");

-- AddForeignKey
ALTER TABLE "AgendaBookmark" ADD CONSTRAINT "AgendaBookmark_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaBookmark" ADD CONSTRAINT "AgendaBookmark_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "AgendaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
