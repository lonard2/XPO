import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { POST as cancelBooking } from "@/app/api/bookings/[id]/cancel/route";
import { POST as transferBooking } from "@/app/api/bookings/[id]/transfer/route";
import { setEmailTransport, type EmailMessage } from "@/lib/email/transport";

const BASE = "http://localhost/api/bookings";

describe("booking cancellation and transfer", () => {
  const stamp = Date.now();
  let organizer: any;
  let holder: any;
  let other: any;
  let event: any;
  let tier: any;
  let booking: any;

  const asUser = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ATTENDEE",
    "x-xpo-user-id": user.id,
  });
  const asOrganizer = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
    "x-xpo-user-id": user.id,
  });

  const cancel = (id: string, headers: Record<string, string>) =>
    cancelBooking(new Request(`${BASE}/${id}/cancel`, { method: "POST", headers }), {
      params: Promise.resolve({ id }),
    });

  const transfer = (id: string, headers: Record<string, string>, body: Record<string, unknown>) =>
    transferBooking(
      new Request(`${BASE}/${id}/transfer`, {
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

    organizer = await db.user.create({
      data: { email: `cancel-org-${stamp}@example.com`, name: "Cancel Organizer", role: "ORGANIZER" },
    });
    holder = await db.user.create({
      data: { email: `cancel-holder-${stamp}@example.com`, name: "Cancel Holder", role: "ATTENDEE" },
    });
    other = await db.user.create({
      data: { email: `cancel-other-${stamp}@example.com`, name: "Cancel Other", role: "ATTENDEE" },
    });

    event = await db.event.create({
      data: {
        organizerId: organizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Cancel Test Event ${stamp}`,
        slug: `cancel-test-${stamp}`,
        description: "Cancellation coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    tier = await db.ticketTier.create({
      data: {
        eventId: event.id,
        name: "Delegate Pass",
        price: 0,
        currency: "IDR",
        capacity: 10,
        soldCount: 1,
      },
    });
    booking = await db.booking.create({
      data: {
        userId: holder.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Cancel Holder",
        attendeeEmail: `cancel-holder-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-CANCEL-${stamp}`,
      },
    });
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.booking.deleteMany({ where: { eventId: event?.id } });
    await db.ticketTier.deleteMany({ where: { eventId: event?.id } });
    await db.event.deleteMany({ where: { id: event?.id } });
    await db.user.deleteMany({
      where: { id: { in: [organizer?.id, holder?.id, other?.id].filter(Boolean) as string[] } },
    });
    await db.$disconnect();
  });

  it("rejects cancellation from someone who does not hold the pass", async () => {
    const res = await cancel(booking.id, asUser(other));
    expect(res.status).toBe(403);
    const stored = await db.booking.findUnique({ where: { id: booking.id } });
    expect(stored?.status).toBe("CONFIRMED");
  });

  it("rejects transfer from someone who does not hold the pass", async () => {
    const res = await transfer(booking.id, asUser(other), {
      attendeeName: "Intruder",
      attendeeEmail: "intruder@example.com",
    });
    expect(res.status).toBe(403);
  });

  it("transfers the pass to a new holder and keeps the QR hash", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const originalHash = booking.qrCodeHash;
    const res = await transfer(booking.id, asUser(holder), {
      attendeeName: "New Holder",
      attendeeEmail: `new-holder-${stamp}@example.com`,
      locale: "en",
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.booking.attendeeName).toBe("New Holder");
    expect(json.booking.attendeeEmail).toBe(`new-holder-${stamp}@example.com`);

    const stored = await db.booking.findUnique({ where: { id: booking.id } });
    expect(stored?.qrCodeHash).toBe(originalHash);
    expect(stored?.attendeeEmail).toBe(`new-holder-${stamp}@example.com`);

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(`new-holder-${stamp}@example.com`);
    expect(sent[0].subject).toContain("transferred");
  });

  it("rejects an invalid transfer email", async () => {
    const res = await transfer(booking.id, asUser(holder), {
      attendeeName: "New Holder",
      attendeeEmail: "not-an-email",
    });
    expect(res.status).toBe(400);
  });

  it("lets the owning organizer cancel, releases the seat, and is idempotent", async () => {
    const before = await db.ticketTier.findUnique({ where: { id: tier.id } });
    expect(before?.soldCount).toBe(1);

    const first = await cancel(booking.id, asOrganizer(organizer));
    expect(first.status).toBe(200);

    const after = await db.ticketTier.findUnique({ where: { id: tier.id } });
    expect(after?.soldCount).toBe(0);
    const stored = await db.booking.findUnique({ where: { id: booking.id } });
    expect(stored?.status).toBe("CANCELLED");

    const again = await cancel(booking.id, asOrganizer(organizer));
    expect(again.status).toBe(200);
    const stillZero = await db.ticketTier.findUnique({ where: { id: tier.id } });
    expect(stillZero?.soldCount).toBe(0);
  });

  it("refuses to transfer a cancelled pass", async () => {
    const res = await transfer(booking.id, asUser(holder), {
      attendeeName: "New Holder",
      attendeeEmail: "new@example.com",
    });
    expect(res.status).toBe(409);
  });

  it("refuses to cancel a checked-in pass", async () => {
    const checkedIn = await db.booking.create({
      data: {
        userId: holder.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Checked In",
        attendeeEmail: `checked-${stamp}@example.com`,
        status: "CHECKED_IN",
        checkedInAt: new Date(),
        qrCodeHash: `XPO-PASS-CHECKED-${stamp}`,
      },
    });

    const res = await cancel(checkedIn.id, asUser(holder));
    expect(res.status).toBe(409);
  });
});
