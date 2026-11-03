import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { POST as checkIn } from "@/app/api/agenda/[id]/check-in/route";
import { GET as getAgenda } from "@/app/api/organizer/events/[id]/agenda/route";

describe("session check-in", () => {
  const stamp = Date.now();
  let organizer: any;
  let otherOrganizer: any;
  let event: any;
  let otherEvent: any;
  let tier: any;
  let booking: any;
  let session: any;
  let foreignSession: any;

  const asOrganizer = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
    "x-xpo-user-id": user.id,
  });

  const scan = (sessionId: string, headers: Record<string, string>, qrCodeHash: string) =>
    checkIn(
      new Request(`http://localhost/api/agenda/${sessionId}/check-in`, {
        method: "POST",
        headers,
        body: JSON.stringify({ qrCodeHash }),
      }),
      { params: Promise.resolve({ id: sessionId }) }
    );

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    organizer = await db.user.create({
      data: { email: `sess-org-${stamp}@example.com`, name: "Session Organizer", role: "ORGANIZER" },
    });
    otherOrganizer = await db.user.create({
      data: { email: `sess-other-${stamp}@example.com`, name: "Other Organizer", role: "ORGANIZER" },
    });

    event = await db.event.create({
      data: {
        organizerId: organizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Session Event ${stamp}`,
        slug: `session-event-${stamp}`,
        description: "Session coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    otherEvent = await db.event.create({
      data: {
        organizerId: otherOrganizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Other Session Event ${stamp}`,
        slug: `other-session-${stamp}`,
        description: "Foreign session.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    tier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 1 },
    });
    booking = await db.booking.create({
      data: {
        userId: organizer.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Session Attendee",
        attendeeEmail: `sess-attendee-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-SESSION-${stamp}`,
      },
    });
    session = await db.agendaItem.create({
      data: {
        eventId: event.id,
        title: "Opening Keynote",
        location: "Hall A1",
        startTime: new Date("2027-10-01T10:00:00Z"),
        endTime: new Date("2027-10-01T11:00:00Z"),
      },
    });
    foreignSession = await db.agendaItem.create({
      data: {
        eventId: otherEvent.id,
        title: "Foreign Keynote",
        location: "Hall B1",
        startTime: new Date("2027-10-01T10:00:00Z"),
        endTime: new Date("2027-10-01T11:00:00Z"),
      },
    });
  });

  afterAll(async () => {
    const eventIds = [event?.id, otherEvent?.id].filter(Boolean);
    await db.sessionCheckIn.deleteMany({ where: { agendaItemId: { in: [session?.id, foreignSession?.id].filter(Boolean) } } });
    await db.booking.deleteMany({ where: { eventId: { in: eventIds } } });
    await db.ticketTier.deleteMany({ where: { eventId: { in: eventIds } } });
    await db.agendaItem.deleteMany({ where: { eventId: { in: eventIds } } });
    await db.event.deleteMany({ where: { id: { in: eventIds } } });
    await db.user.deleteMany({
      where: { id: { in: [organizer?.id, otherOrganizer?.id].filter(Boolean) as string[] } },
    });
    await db.$disconnect();
  });

  it("records a check-in and is idempotent on repeat", async () => {
    const first = await scan(session.id, asOrganizer(organizer), booking.qrCodeHash);
    expect(first.status).toBe(201);
    const firstJson = await first.json();
    expect(firstJson.alreadyCheckedIn).toBe(false);
    expect(firstJson.attendee.name).toBe("Session Attendee");

    const again = await scan(session.id, asOrganizer(organizer), booking.qrCodeHash);
    expect(again.status).toBe(200);
    expect((await again.json()).alreadyCheckedIn).toBe(true);
    expect(await db.sessionCheckIn.count({ where: { agendaItemId: session.id } })).toBe(1);
  });

  it("rejects a different organizer", async () => {
    const res = await scan(session.id, asOrganizer(otherOrganizer), booking.qrCodeHash);
    expect(res.status).toBe(403);
  });

  it("rejects an unknown pass and a foreign event's pass", async () => {
    expect((await scan(session.id, asOrganizer(organizer), "XPO-PASS-UNKNOWN")).status).toBe(404);
    expect((await scan(foreignSession.id, asOrganizer(organizer), booking.qrCodeHash)).status).toBe(403);
  });

  it("rejects a cancelled pass", async () => {
    await db.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    const res = await scan(session.id, asOrganizer(organizer), booking.qrCodeHash);
    expect(res.status).toBe(409);
    await db.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } });
  });

  it("scopes the agenda list to the owning organizer", async () => {
    const own = await getAgenda(
      new Request(`http://localhost/api/organizer/events/${event.id}/agenda`, {
        headers: asOrganizer(organizer),
      }),
      { params: Promise.resolve({ id: event.id }) }
    );
    expect(own.status).toBe(200);
    expect((await own.json()).sessions.map((s: any) => s.id)).toContain(session.id);

    const foreign = await getAgenda(
      new Request(`http://localhost/api/organizer/events/${event.id}/agenda`, {
        headers: asOrganizer(otherOrganizer),
      }),
      { params: Promise.resolve({ id: event.id }) }
    );
    expect(foreign.status).toBe(403);
  });
});
