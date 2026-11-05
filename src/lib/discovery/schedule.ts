import { db } from "@/lib/db";
import { listingWhere, type ScheduleStub } from "./presentation";

/**
 * Venue schedule rows with discreet identity projected away at the query.
 *
 * Public rows load in full. Discreet rows load through a `select` that
 * never touches title, organizer, imagery, copy, tiers, agenda, or booths,
 * so identity cannot leak through a future prop pass-through. Hidden rows
 * are excluded entirely.
 */
export async function loadVenueSchedule(venueId: string) {
  const [publicEvents, discreetEvents] = await Promise.all([
    db.event.findMany({
      where: { venueId, ...listingWhere() },
      include: {
        venue: true,
        ticketTiers: true,
        region: true,
      },
      orderBy: { startDate: "asc" },
    }),
    db.event.findMany({
      where: { venueId, visibility: "DISCREET" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        venueHall: { select: { name: true } },
      },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const stubs: ScheduleStub[] = discreetEvents.map((row) => ({
    id: row.id,
    discreet: true,
    venueHallName: row.venueHall?.name ?? null,
    startDate: row.startDate,
    endDate: row.endDate,
  }));

  return [...publicEvents, ...stubs].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}
