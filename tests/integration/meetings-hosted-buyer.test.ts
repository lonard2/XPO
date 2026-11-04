import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { POST as submitRequest } from "@/app/api/meetings/request/route";
import { PATCH as decideRequest } from "@/app/api/meetings/requests/[id]/route";
import { POST as rateMeeting } from "@/app/api/meetings/requests/[id]/rating/route";
import { GET as meetingAnalytics } from "@/app/api/meetings/analytics/route";
import { PATCH as setTierQuota } from "@/app/api/organizer/tiers/[id]/route";
import { setEmailTransport } from "@/lib/email/transport";

const MEETINGS = "http://localhost/api/meetings";

describe("hosted-buyer program", () => {
  const stamp = Date.now();
  let organizer: any;
  let otherOrganizer: any;
  let buyer: any;
  let stranger: any;
  let event: any;
  let quotaTier: any;
  let openTier: any;
  let booking: any;

  const asUser = (user: any, role = "ATTENDEE") => ({
    "Content-Type": "application/json",
    Cookie: `xpo_role=${role}`,
    "x-xpo-user-id": user.id,
  });
  const asOrganizer = () => asUser(organizer, "ORGANIZER");

  const submit = (body: Record<string, unknown>) =>
    submitRequest(
      new Request(`${MEETINGS}/request`, {
        method: "POST",
        headers: asUser(buyer),
        body: JSON.stringify(body),
      })
    );

  const decide = (id: string, body: Record<string, unknown>) =>
    decideRequest(
      new Request(`${MEETINGS}/requests/${id}`, {
        method: "PATCH",
        headers: asOrganizer(),
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id }) }
    );

  const rate = (id: string, headers: Record<string, string>, rating: unknown) =>
    rateMeeting(
      new Request(`${MEETINGS}/requests/${id}/rating`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating }),
      }),
      { params: Promise.resolve({ id }) }
    );

  const base = (overrides: Record<string, unknown> = {}) => ({
    eventId: event.id,
    type: "BUYER_APPOINTMENT",
    requesterName: "Hosted Buyer",
    requesterEmail: `hosted-${stamp}@example.com`,
    target: "Pavilion 7",
    ...overrides,
  });

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    organizer = await db.user.create({
      data: { email: `hb-org-${stamp}@example.com`, name: "HB Organizer", role: "ORGANIZER" },
    });
    otherOrganizer = await db.user.create({
      data: { email: `hb-org2-${stamp}@example.com`, name: "HB Other", role: "ORGANIZER" },
    });
    buyer = await db.user.create({
      data: { email: `hosted-${stamp}@example.com`, name: "Hosted Buyer", role: "ATTENDEE" },
    });
    stranger = await db.user.create({
      data: { email: `hb-str-${stamp}@example.com`, name: "HB Stranger", role: "ATTENDEE" },
    });

    event = await db.event.create({
      data: {
        organizerId: organizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Hosted Buyer Event ${stamp}`,
        slug: `hosted-buyer-${stamp}`,
        description: "Quota and outcome coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-03T18:00:00Z"),
      },
    });
    quotaTier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Hosted Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 1, meetingQuota: 1 },
    });
    openTier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Open Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 0, meetingQuota: 0 },
    });
    booking = await db.booking.create({
      data: {
        userId: buyer.id,
        eventId: event.id,
        ticketTierId: quotaTier.id,
        attendeeName: "Hosted Buyer",
        attendeeEmail: `hosted-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-HB-${stamp}`,
      },
    });
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.meetingRequest.deleteMany({ where: { eventId: event?.id } });
    await db.booking.deleteMany({ where: { eventId: event?.id } });
    await db.ticketTier.deleteMany({ where: { eventId: event?.id } });
    await db.event.deleteMany({ where: { id: event?.id } });
    await db.user.deleteMany({
      where: {
        id: { in: [organizer?.id, otherOrganizer?.id, buyer?.id, stranger?.id].filter(Boolean) as string[] },
      },
    });
    await db.$disconnect();
  });

  it("confirms the first buyer appointment inside the quota", async () => {
    const created = await submit(base());
    expect(created.status).toBe(201);
    const id = (await created.json()).requestId;
    const res = await decide(id, { status: "CONFIRMED" });
    expect(res.status).toBe(200);
  });

  it("refuses the second buyer appointment once the quota is spent", async () => {
    const created = await submit(base());
    const id = (await created.json()).requestId;
    const res = await decide(id, { status: "CONFIRMED" });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain("QUOTA_EXCEEDED");
  });

  it("leaves other request types and quota-free tiers alone", async () => {
    const rfq = await submit({ ...base(), type: "RFQ" });
    expect((await decide((await rfq.json()).requestId, { status: "CONFIRMED" })).status).toBe(200);

    await db.booking.update({ where: { id: booking.id }, data: { ticketTierId: openTier.id } });
    const open = await submit(base());
    expect((await decide((await open.json()).requestId, { status: "CONFIRMED" })).status).toBe(200);
    await db.booking.update({ where: { id: booking.id }, data: { ticketTierId: quotaTier.id } });
  });

  it("records held and no-show only on confirmed meetings", async () => {
    const pending = await submit(base());
    const pendingId = (await pending.json()).requestId;
    expect((await decide(pendingId, { outcome: "HELD" })).status).toBe(400);
    expect((await decide(pendingId, { outcome: "MAYBE" })).status).toBe(400);

    // Free the quota for this check: move the pass to the open tier.
    await db.booking.update({ where: { id: booking.id }, data: { ticketTierId: openTier.id } });
    expect((await decide(pendingId, { status: "CONFIRMED" })).status).toBe(200);
    const held = await decide(pendingId, { outcome: "HELD" });
    expect(held.status).toBe(200);
    expect((await held.json()).request.outcome).toBe("HELD");
    await db.booking.update({ where: { id: booking.id }, data: { ticketTierId: quotaTier.id } });
  });

  it("lets the requester rate a held meeting, nobody else", async () => {
    const held = await db.meetingRequest.findFirst({
      where: { eventId: event.id, outcome: "HELD" },
    });
    expect(held).toBeDefined();

    expect((await rate(held!.id, asUser(buyer), 0)).status).toBe(400);
    expect((await rate(held!.id, asUser(buyer), 6)).status).toBe(400);
    expect((await rate(held!.id, asUser(stranger), 5)).status).toBe(403);

    const res = await rate(held!.id, asUser(buyer), 5);
    expect(res.status).toBe(200);
    expect((await res.json()).request.rating).toBe(5);
  });

  it("refuses ratings before the meeting is held", async () => {
    await db.booking.update({ where: { id: booking.id }, data: { ticketTierId: openTier.id } });
    const created = await submit(base());
    const id = (await created.json()).requestId;
    await decide(id, { status: "CONFIRMED" });
    expect((await rate(id, asUser(buyer), 4)).status).toBe(409);
    await db.booking.update({ where: { id: booking.id }, data: { ticketTierId: quotaTier.id } });
  });

  it("validates and scopes tier quota changes", async () => {
    const bad = await setTierQuota(
      new Request(`http://localhost/api/organizer/tiers/${quotaTier.id}`, {
        method: "PATCH",
        headers: asOrganizer(),
        body: JSON.stringify({ meetingQuota: -1 }),
      }),
      { params: Promise.resolve({ id: quotaTier.id }) }
    );
    expect(bad.status).toBe(400);

    const foreign = await setTierQuota(
      new Request(`http://localhost/api/organizer/tiers/${quotaTier.id}`, {
        method: "PATCH",
        headers: asUser(otherOrganizer, "ORGANIZER"),
        body: JSON.stringify({ meetingQuota: 5 }),
      }),
      { params: Promise.resolve({ id: quotaTier.id }) }
    );
    expect(foreign.status).toBe(403);

    const ok = await setTierQuota(
      new Request(`http://localhost/api/organizer/tiers/${quotaTier.id}`, {
        method: "PATCH",
        headers: asOrganizer(),
        body: JSON.stringify({ meetingQuota: 2 }),
      }),
      { params: Promise.resolve({ id: quotaTier.id }) }
    );
    expect(ok.status).toBe(200);
    expect((await ok.json()).tier.meetingQuota).toBe(2);
    await db.ticketTier.update({ where: { id: quotaTier.id }, data: { meetingQuota: 1 } });
  });

  it("reports the funnel, outcomes, ratings and quota usage", async () => {
    const scoped = await meetingAnalytics(
      new Request(`http://localhost/api/meetings/analytics?eventId=${event.id}`, {
        headers: asOrganizer(),
      })
    );
    expect(scoped.status).toBe(200);
    const json = await scoped.json();
    const a = json.analytics;
    expect(a.requested).toBeGreaterThanOrEqual(a.confirmed + a.pending + a.declined);
    expect(a.confirmed).toBeGreaterThanOrEqual(a.held);
    expect(a.ratedCount).toBeGreaterThanOrEqual(1);
    expect(a.avgRating).toBe(5);
    const quotaRow = a.tiers.find((t: any) => t.tierId === quotaTier.id);
    expect(quotaRow.quota).toBe(1);
    expect(quotaRow.confirmed).toBeGreaterThanOrEqual(1);

    const denied = await meetingAnalytics(
      new Request(`http://localhost/api/meetings/analytics?eventId=${event.id}`, {
        headers: asUser(otherOrganizer, "ORGANIZER"),
      })
    );
    expect(denied.status).toBe(403);
  });
});
