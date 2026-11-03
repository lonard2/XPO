import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { POST as saveAgenda } from "@/app/api/bookings/[id]/agenda/route";

const BASE = "http://localhost/api/bookings";

describe("persistent agenda bookmarks", () => {
  const stamp = Date.now();
  let holder: any;
  let other: any;
  let event: any;
  let otherEvent: any;
  let tier: any;
  let booking: any;
  let session: any;
  let foreignSession: any;

  const asUser = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ATTENDEE",
    "x-xpo-user-id": user.id,
  });

  const save = (id: string, headers: Record<string, string>, body: Record<string, unknown>) =>
    saveAgenda(
      new Request(`${BASE}/${id}/agenda`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id }) }
    );

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    holder = await db.user.create({
      data: { email: `agenda-holder-${stamp}@example.com`, name: "Agenda Holder", role: "ATTENDEE" },
    });
    other = await db.user.create({
      data: { email: `agenda-other-${stamp}@example.com`, name: "Agenda Other", role: "ATTENDEE" },
    });

    event = await db.event.create({
      data: {
        regionId: "id",
        venueId: venue!.id,
        title: `Agenda Event ${stamp}`,
        slug: `agenda-event-${stamp}`,
        description: "Agenda coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    otherEvent = await db.event.create({
      data: {
        regionId: "id",
        venueId: venue!.id,
        title: `Agenda Other Event ${stamp}`,
        slug: `agenda-other-${stamp}`,
        description: "Foreign agenda.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    tier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 1 },
    });
    booking = await db.booking.create({
      data: {
        userId: holder.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Agenda Holder",
        attendeeEmail: `agenda-holder-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-AGENDA-${stamp}`,
      },
    });
    session = await db.agendaItem.create({
      data: {
        eventId: event.id,
        title: "Keynote",
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
    await db.agendaBookmark.deleteMany({ where: { bookingId: booking?.id } });
    await db.booking.deleteMany({ where: { eventId: event?.id } });
    await db.ticketTier.deleteMany({ where: { eventId: event?.id } });
    await db.agendaItem.deleteMany({ where: { eventId: { in: [event?.id, otherEvent?.id].filter(Boolean) } } });
    await db.event.deleteMany({ where: { id: { in: [event?.id, otherEvent?.id].filter(Boolean) } } });
    await db.user.deleteMany({ where: { id: { in: [holder?.id, other?.id].filter(Boolean) as string[] } } });
    await db.$disconnect();
  });

  it("saves a session and is idempotent on repeat", async () => {
    const first = await save(booking.id, asUser(holder), {
      agendaItemId: session.id,
      saved: true,
    });
    expect(first.status).toBe(200);

    const second = await save(booking.id, asUser(holder), {
      agendaItemId: session.id,
      saved: true,
    });
    expect(second.status).toBe(200);
    expect(await db.agendaBookmark.count({ where: { bookingId: booking.id } })).toBe(1);
  });

  it("removes a saved session", async () => {
    const res = await save(booking.id, asUser(holder), {
      agendaItemId: session.id,
      saved: false,
    });
    expect(res.status).toBe(200);
    expect(await db.agendaBookmark.count({ where: { bookingId: booking.id } })).toBe(0);
  });

  it("rejects a different user", async () => {
    const res = await save(booking.id, asUser(other), {
      agendaItemId: session.id,
      saved: true,
    });
    expect(res.status).toBe(403);
  });

  it("rejects a session from another event", async () => {
    const res = await save(booking.id, asUser(holder), {
      agendaItemId: foreignSession.id,
      saved: true,
    });
    expect(res.status).toBe(404);
  });

  it("rejects an agenda change on a cancelled pass", async () => {
    await db.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    const res = await save(booking.id, asUser(holder), {
      agendaItemId: session.id,
      saved: true,
    });
    expect(res.status).toBe(409);
    await db.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } });
  });
});
