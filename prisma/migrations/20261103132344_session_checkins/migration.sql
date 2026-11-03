-- CreateTable
CREATE TABLE "SessionCheckIn" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "agendaItemId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionCheckIn_agendaItemId_idx" ON "SessionCheckIn"("agendaItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionCheckIn_bookingId_agendaItemId_key" ON "SessionCheckIn"("bookingId", "agendaItemId");

-- AddForeignKey
ALTER TABLE "SessionCheckIn" ADD CONSTRAINT "SessionCheckIn_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionCheckIn" ADD CONSTRAINT "SessionCheckIn_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "AgendaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
