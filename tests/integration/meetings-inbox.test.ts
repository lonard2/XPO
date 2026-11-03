import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { GET as listRequests } from "@/app/api/meetings/requests/route";
import { PATCH as decideRequest } from "@/app/api/meetings/requests/[id]/route";
import { setEmailTransport, type EmailMessage } from "@/lib/email/transport";

const LIST_URL = "http://localhost/api/meetings/requests";

describe("organizer meeting request inbox", () => {
  const stamp = Date.now();
  let venueId = "";
  let organizerA: any;
  let organizerB: any;
  let eventA: any;
  let eventB: any;
  let requestA: any;
  let requestB: any;

  const asOrganizer = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
    "x-xpo-user-id": user.id,
  });
  const asAdmin = { "Content-Type": "application/json", Cookie: "xpo_role=ADMIN" };

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();
    venueId = venue!.id;

    organizerA = await db.user.create({
      data: { email: `inbox-a-${stamp}@example.com`, name: "Inbox Organizer A", role: "ORGANIZER" },
    });
    organizerB = await db.user.create({
      data: { email: `inbox-b-${stamp}@example.com`, name: "Inbox Organizer B", role: "ORGANIZER" },
    });

    eventA = await db.event.create({
      data: {
        organizerId: organizerA.id,
        regionId: "id",
        venueId,
        title: `Inbox Event A ${stamp}`,
        slug: `inbox-a-${stamp}`,
        description: "Owned by A.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    eventB = await db.event.create({
      data: {
        organizerId: organizerB.id,
        regionId: "id",
        venueId,
        title: `Inbox Event B ${stamp}`,
        slug: `inbox-b-${stamp}`,
        description: "Owned by B.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });

    requestA = await db.meetingRequest.create({
      data: {
        eventId: eventA.id,
        type: "RFQ",
        requesterName: "Buyer A",
        requesterEmail: `buyer-a-${stamp}@example.com`,
        target: "Apex Robotics",
      },
    });
    requestB = await db.meetingRequest.create({
      data: {
        eventId: eventB.id,
        type: "DEAL_SLOT",
        requesterName: "Buyer B",
        requesterEmail: `buyer-b-${stamp}@example.com`,
        target: "Fund B",
      },
    });
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.event.deleteMany({ where: { id: { in: [eventA?.id, eventB?.id].filter(Boolean) } } });
    await db.user.deleteMany({
      where: { id: { in: [organizerA?.id, organizerB?.id].filter(Boolean) as string[] } },
    });
    await db.$disconnect();
  });

  it("rejects an unauthenticated list with 401", async () => {
    const res = await listRequests(new Request(LIST_URL));
    expect(res.status).toBe(401);
  });

  it("lists only the organizer's own requests with a pending count", async () => {
    const res = await listRequests(new Request(LIST_URL, { headers: asOrganizer(organizerA) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requests.every((r: any) => r.event.id === eventA.id)).toBe(true);
    expect(json.requests.some((r: any) => r.id === requestB.id)).toBe(false);
    expect(json.pending).toBe(1);
  });

  it("lets an admin see every request", async () => {
    const res = await listRequests(new Request(LIST_URL, { headers: asAdmin }));
    const json = await res.json();
    const ids = json.requests.map((r: any) => r.id);
    expect(ids).toContain(requestA.id);
    expect(ids).toContain(requestB.id);
  });

  it("rejects a decision from a different organizer with 403", async () => {
    const res = await decideRequest(
      new Request(`${LIST_URL}/${requestA.id}`, {
        method: "PATCH",
        headers: asOrganizer(organizerB),
        body: JSON.stringify({ status: "CONFIRMED" }),
      }),
      { params: Promise.resolve({ id: requestA.id }) }
    );
    expect(res.status).toBe(403);
  });

  it("rejects an invalid decision and an unknown request", async () => {
    const bad = await decideRequest(
      new Request(`${LIST_URL}/${requestA.id}`, {
        method: "PATCH",
        headers: asOrganizer(organizerA),
        body: JSON.stringify({ status: "MAYBE" }),
      }),
      { params: Promise.resolve({ id: requestA.id }) }
    );
    expect(bad.status).toBe(400);

    const missing = await decideRequest(
      new Request(`${LIST_URL}/does-not-exist`, {
        method: "PATCH",
        headers: asOrganizer(organizerA),
        body: JSON.stringify({ status: "CONFIRMED" }),
      }),
      { params: Promise.resolve({ id: "does-not-exist" }) }
    );
    expect(missing.status).toBe(404);
  });

  it("confirms the request and emails the requester", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const res = await decideRequest(
      new Request(`${LIST_URL}/${requestA.id}`, {
        method: "PATCH",
        headers: asOrganizer(organizerA),
        body: JSON.stringify({ status: "CONFIRMED" }),
      }),
      { params: Promise.resolve({ id: requestA.id }) }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.request.status).toBe("CONFIRMED");

    const stored = await db.meetingRequest.findUnique({ where: { id: requestA.id } });
    expect(stored?.status).toBe("CONFIRMED");

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(`buyer-a-${stamp}@example.com`);
    expect(sent[0].subject).toContain("confirmed");
  });
});
