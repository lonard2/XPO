import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { POST as joinWaitlist, DELETE as leaveWaitlist } from "@/app/api/events/[id]/waitlist/route";
import { POST as cancelBooking } from "@/app/api/bookings/[id]/cancel/route";
import { setEmailTransport, type EmailMessage } from "@/lib/email/transport";

describe("tier waitlist", () => {
  const stamp = Date.now();
  let holder: any;
  let event: any;
  let soldOutTier: any;
  let openTier: any;
  let booking: any;

  const asHolder = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ATTENDEE",
    "x-xpo-user-id": user.id,
  });

  const join = (eventId: string, body: Record<string, unknown>) =>
    joinWaitlist(
      new Request(`http://localhost/api/events/${eventId}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id: eventId }) }
    );

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    holder = await db.user.create({
      data: { email: `wait-holder-${stamp}@example.com`, name: "Wait Holder", role: "ATTENDEE" },
    });

    event = await db.event.create({
      data: {
        regionId: "id",
        venueId: venue!.id,
        title: `Waitlist Event ${stamp}`,
        slug: `waitlist-event-${stamp}`,
        description: "Waitlist coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    soldOutTier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Sold Out Pass", price: 0, currency: "IDR", capacity: 1, soldCount: 1 },
    });
    openTier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Open Pass", price: 0, currency: "IDR", capacity: 5, soldCount: 0 },
    });
    booking = await db.booking.create({
      data: {
        userId: holder.id,
        eventId: event.id,
        ticketTierId: soldOutTier.id,
        attendeeName: "Wait Holder",
        attendeeEmail: `wait-holder-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-WAIT-${stamp}`,
      },
    });
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.waitlistEntry.deleteMany({ where: { eventId: event?.id } });
    await db.booking.deleteMany({ where: { eventId: event?.id } });
    await db.ticketTier.deleteMany({ where: { eventId: event?.id } });
    await db.event.deleteMany({ where: { id: event?.id } });
    await db.user.deleteMany({ where: { id: holder?.id } });
    await db.$disconnect();
  });

  it("joins a sold-out tier and reports the position", async () => {
    const res = await join(event.id, {
      tierId: soldOutTier.id,
      name: "Queue One",
      email: `queue-one-${stamp}@example.com`,
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.position).toBe(1);
  });

  it("is idempotent for the same tier and email", async () => {
    const res = await join(event.id, {
      tierId: soldOutTier.id,
      name: "Queue One",
      email: `queue-one-${stamp}@example.com`,
    });
    expect(res.status).toBe(201);
    expect(
      await db.waitlistEntry.count({
        where: { ticketTierId: soldOutTier.id, email: `queue-one-${stamp}@example.com` },
      })
    ).toBe(1);
  });

  it("refuses a tier that still has seats", async () => {
    const res = await join(event.id, {
      tierId: openTier.id,
      name: "Too Early",
      email: `too-early-${stamp}@example.com`,
    });
    expect(res.status).toBe(409);
  });

  it("promotes the head of the queue when a seat is cancelled, and emails them", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const res = await cancelBooking(
      new Request(`http://localhost/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: asHolder(holder),
      }),
      { params: Promise.resolve({ id: booking.id }) }
    );
    expect(res.status).toBe(200);

    const entry = await db.waitlistEntry.findFirst({
      where: { ticketTierId: soldOutTier.id, email: `queue-one-${stamp}@example.com` },
    });
    expect(entry?.status).toBe("PROMOTED");
    expect(entry?.promotedAt).toBeTruthy();

    const promotion = sent.find((message) => message.to === `queue-one-${stamp}@example.com`);
    expect(promotion).toBeDefined();
    expect(promotion?.subject).toContain("A seat opened");
  });

  it("lets a pending entry leave the queue", async () => {
    // The cancellation test freed the only seat; refill it so the tier is
    // sold out again for this join.
    await db.ticketTier.update({ where: { id: soldOutTier.id }, data: { soldCount: 1 } });
    const email = `leaver-${stamp}@example.com`;
    await join(event.id, { tierId: soldOutTier.id, name: "Leaver", email });

    const res = await leaveWaitlist(
      new Request(
        `http://localhost/api/events/${event.id}/waitlist?tierId=${soldOutTier.id}&email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ id: event.id }) }
    );
    expect(res.status).toBe(200);

    const entry = await db.waitlistEntry.findFirst({
      where: { ticketTierId: soldOutTier.id, email },
    });
    expect(entry?.status).toBe("CANCELLED");
  });
});
