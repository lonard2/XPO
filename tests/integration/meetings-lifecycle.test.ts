import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { POST as submitRequest } from "@/app/api/meetings/request/route";
import { GET as listRequests } from "@/app/api/meetings/requests/route";
import { PATCH as decideRequest } from "@/app/api/meetings/requests/[id]/route";
import { setEmailTransport, type EmailMessage } from "@/lib/email/transport";

const BASE = "http://localhost/api/meetings";

describe("meeting request lifecycle", () => {
  const stamp = Date.now();
  let organizer: any;
  let requester: any;
  let stranger: any;
  let event: any;
  let otherEvent: any;
  let tier: any;
  let booking: any;
  let booth: any;
  let foreignBooth: any;

  const asUser = (user: any, role = "ATTENDEE") => ({
    "Content-Type": "application/json",
    Cookie: `xpo_role=${role}`,
    "x-xpo-user-id": user.id,
  });

  const submit = (body: Record<string, unknown>, headers?: Record<string, string>) =>
    submitRequest(
      new Request(`${BASE}/request`, {
        method: "POST",
        headers: headers ?? { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );

  const decide = (id: string, headers: Record<string, string>, body: Record<string, unknown>) =>
    decideRequest(
      new Request(`${BASE}/requests/${id}`, {
        method: "PATCH",
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
      data: { email: `cycle-org-${stamp}@example.com`, name: "Cycle Organizer", role: "ORGANIZER" },
    });
    requester = await db.user.create({
      data: { email: `cycle-req-${stamp}@example.com`, name: "Cycle Requester", role: "ATTENDEE" },
    });
    stranger = await db.user.create({
      data: { email: `cycle-str-${stamp}@example.com`, name: "Cycle Stranger", role: "ATTENDEE" },
    });

    const start = new Date("2027-10-01T09:00:00Z");
    const end = new Date("2027-10-03T18:00:00Z");
    event = await db.event.create({
      data: {
        organizerId: organizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Cycle Event ${stamp}`,
        slug: `cycle-event-${stamp}`,
        description: "Lifecycle coverage.",
        startDate: start,
        endDate: end,
      },
    });
    otherEvent = await db.event.create({
      data: {
        organizerId: organizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Cycle Other Event ${stamp}`,
        slug: `cycle-other-${stamp}`,
        description: "Foreign booth home.",
        startDate: start,
        endDate: end,
      },
    });
    tier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 1 },
    });
    booking = await db.booking.create({
      data: {
        userId: requester.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Cycle Requester",
        attendeeEmail: `cycle-req-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-CYCLE-${stamp}`,
      },
    });
    booth = await db.boothTenant.create({
      data: { eventId: event.id, companyName: "Cycle Robotics", boothNumber: "C-9", hallName: "Hall C" },
    });
    foreignBooth = await db.boothTenant.create({
      data: { eventId: otherEvent.id, companyName: "Foreign Co", boothNumber: "F-1", hallName: "Hall F" },
    });
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.meetingRequest.deleteMany({ where: { eventId: { in: [event?.id, otherEvent?.id].filter(Boolean) } } });
    await db.booking.deleteMany({ where: { eventId: event?.id } });
    await db.ticketTier.deleteMany({ where: { eventId: event?.id } });
    await db.boothTenant.deleteMany({ where: { eventId: { in: [event?.id, otherEvent?.id].filter(Boolean) } } });
    await db.event.deleteMany({ where: { id: { in: [event?.id, otherEvent?.id].filter(Boolean) } } });
    await db.user.deleteMany({
      where: { id: { in: [organizer?.id, requester?.id, stranger?.id].filter(Boolean) as string[] } },
    });
    await db.$disconnect();
  });

  const base = () => ({
    eventId: event.id,
    type: "DEAL_SLOT",
    requesterName: "Cycle Requester",
    requesterEmail: `cycle-req-${stamp}@example.com`,
    target: "Cycle Robotics",
  });

  it("links the signed-in requester, their pass, and the booth", async () => {
    const res = await submit({ ...base(), boothId: booth.id }, asUser(requester));
    expect(res.status).toBe(201);
    const json = await res.json();
    const stored = await db.meetingRequest.findUnique({ where: { id: json.requestId } });
    expect(stored?.requesterId).toBe(requester.id);
    expect(stored?.bookingId).toBe(booking.id);
    expect(stored?.boothId).toBe(booth.id);
  });

  it("leaves anonymous requests unlinked", async () => {
    const res = await submit({ ...base(), requesterEmail: `anon-${stamp}@example.com` });
    expect(res.status).toBe(201);
    const stored = await db.meetingRequest.findUnique({
      where: { id: (await res.json()).requestId },
    });
    expect(stored?.requesterId).toBeNull();
    expect(stored?.bookingId).toBeNull();
  });

  it("leaves the pass unlinked when several passes make it ambiguous", async () => {
    await db.booking.create({
      data: {
        userId: requester.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Cycle Requester",
        attendeeEmail: `cycle-req-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-CYCLE-2-${stamp}`,
      },
    });
    const res = await submit({ ...base() }, asUser(requester));
    expect(res.status).toBe(201);
    const stored = await db.meetingRequest.findUnique({
      where: { id: (await res.json()).requestId },
    });
    expect(stored?.requesterId).toBe(requester.id);
    expect(stored?.bookingId).toBeNull();
  });

  it("rejects a booth from another event", async () => {
    const res = await submit({ ...base(), boothId: foreignBooth.id }, asUser(requester));
    expect(res.status).toBe(404);
  });

  it("confirms with a schedule inside the event and emails the time", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const created = await submit({ ...base() }, asUser(requester));
    const id = (await created.json()).requestId;
    const res = await decide(
      id,
      asUser(organizer, "ORGANIZER"),
      { status: "CONFIRMED", scheduledAt: "2027-10-02T10:30:00Z", location: "Hall A1, Table 4" }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.request.status).toBe("CONFIRMED");
    expect(new Date(json.request.scheduledAt).toISOString()).toBe("2027-10-02T10:30:00.000Z");
    expect(json.request.location).toBe("Hall A1, Table 4");

    const mail = sent.find((message) => message.subject.startsWith("Request confirmed"));
    expect(mail?.to).toBe(`cycle-req-${stamp}@example.com`);
    expect(mail?.text).toContain("When:");
    expect(mail?.text).toContain("Hall A1, Table 4");
  });

  it("rejects a schedule outside the event dates", async () => {
    const created = await submit({ ...base() }, asUser(requester));
    const id = (await created.json()).requestId;
    const res = await decide(
      id,
      asUser(organizer, "ORGANIZER"),
      { status: "CONFIRMED", scheduledAt: "2027-11-01T10:00:00Z" }
    );
    expect(res.status).toBe(400);
  });

  it("reschedules a confirmed request and notifies the requester", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const created = await submit({ ...base() }, asUser(requester));
    const id = (await created.json()).requestId;
    await decide(id, asUser(organizer, "ORGANIZER"), {
      status: "CONFIRMED",
      scheduledAt: "2027-10-02T10:30:00Z",
    });

    const res = await decide(id, asUser(organizer, "ORGANIZER"), {
      scheduledAt: "2027-10-02T14:00:00Z",
      location: "Hall B2",
    });
    expect(res.status).toBe(200);
    expect((await res.json()).request.status).toBe("CONFIRMED");

    const mail = sent.find((message) => message.subject.includes("rescheduled"));
    expect(mail).toBeDefined();
    expect(mail?.text).toContain("Hall B2");
  });

  it("clears the schedule when declining", async () => {
    const created = await submit({ ...base() }, asUser(requester));
    const id = (await created.json()).requestId;
    await decide(id, asUser(organizer, "ORGANIZER"), {
      status: "CONFIRMED",
      scheduledAt: "2027-10-02T10:30:00Z",
      location: "Hall A1",
    });
    const res = await decide(id, asUser(organizer, "ORGANIZER"), { status: "DECLINED" });
    expect(res.status).toBe(200);
    const stored = await db.meetingRequest.findUnique({ where: { id } });
    expect(stored?.scheduledAt).toBeNull();
    expect(stored?.location).toBe("");
  });

  it("rejects an empty update", async () => {
    const created = await submit({ ...base() }, asUser(requester));
    const id = (await created.json()).requestId;
    const res = await decide(id, asUser(organizer, "ORGANIZER"), {});
    expect(res.status).toBe(400);
  });

  it("shows attendees only their own requests", async () => {
    const mine = await listRequests(
      new Request(`${BASE}/requests`, { headers: asUser(requester) })
    );
    expect(mine.status).toBe(200);
    const json = await mine.json();
    expect(json.requests.length).toBeGreaterThan(0);
    expect(
      json.requests.every(
        (r: any) => r.requesterId === requester.id || r.requesterEmail === `cycle-req-${stamp}@example.com`
      )
    ).toBe(true);

    const theirs = await listRequests(
      new Request(`${BASE}/requests`, { headers: asUser(stranger) })
    );
    expect((await theirs.json()).requests).toEqual([]);
  });
});
