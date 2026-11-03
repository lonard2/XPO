import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/sessionStore";
import { GET as getEvents, POST as createEvent } from "@/app/api/organizer/events/route";
import { POST as createBooth } from "@/app/api/organizer/booths/route";
import { DELETE as deleteEvent } from "@/app/api/admin/events/[id]/route";
import { GET as listUsers } from "@/app/api/admin/users/route";

const EVENTS_URL = "http://localhost/api/organizer/events";
const BOOTHS_URL = "http://localhost/api/organizer/booths";
const USERS_URL = "http://localhost/api/admin/users";

describe("auth guards deny by default", () => {
  const stamp = Date.now();
  let venue: any;
  let organizerA: any;
  let organizerB: any;
  let attendee: any;
  const eventIds: string[] = [];

  const asOrganizer = (user: any) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
    "x-xpo-user-id": user.id,
  });

  const eventBody = (overrides: Record<string, unknown> = {}) => ({
    title: `Guard Test Event ${stamp}`,
    description: "Auth guard coverage.",
    regionId: "id",
    venueId: venue.id,
    startDate: "2027-10-01T09:00:00.000Z",
    endDate: "2027-10-03T18:00:00.000Z",
    ticketTiers: [],
    ...overrides,
  });

  beforeAll(async () => {
    await db.$connect();
    venue = await db.venue.findFirst({ include: { halls: true } });
    expect(venue).toBeDefined();

    organizerA = await db.user.create({
      data: { email: `guard-a-${stamp}@example.com`, name: "Guard Organizer A", role: "ORGANIZER" },
    });
    organizerB = await db.user.create({
      data: { email: `guard-b-${stamp}@example.com`, name: "Guard Organizer B", role: "ORGANIZER" },
    });
    attendee = await db.user.create({
      data: { email: `guard-c-${stamp}@example.com`, name: "Guard Attendee", role: "ATTENDEE" },
    });
  });

  afterAll(async () => {
    if (eventIds.length) {
      await db.event.deleteMany({ where: { id: { in: eventIds } } });
    }
    await db.user.deleteMany({
      where: { id: { in: [organizerA?.id, organizerB?.id, attendee?.id].filter(Boolean) as string[] } },
    });
    await db.$disconnect();
  });

  it("rejects an unauthenticated event creation with 401", async () => {
    const res = await createEvent(
      new Request(EVENTS_URL, { method: "POST", body: JSON.stringify(eventBody()) })
    );
    expect(res.status).toBe(401);
    expect(await db.event.count({ where: { title: `Guard Test Event ${stamp}` } })).toBe(0);
  });

  it("rejects an attendee with 403", async () => {
    const res = await createEvent(
      new Request(EVENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "xpo_role=ATTENDEE" },
        body: JSON.stringify(eventBody()),
      })
    );
    expect(res.status).toBe(403);
  });

  it("attributes an organizer's event to the caller, not a body value", async () => {
    const res = await createEvent(
      new Request(EVENTS_URL, {
        method: "POST",
        headers: asOrganizer(organizerA),
        body: JSON.stringify(eventBody({ organizerId: organizerB.id })),
      })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.event.organizerId).toBe(organizerA.id);
    eventIds.push(json.event.id);
  });

  it("rejects an unauthenticated event list with 401", async () => {
    const res = await getEvents(new Request(EVENTS_URL));
    expect(res.status).toBe(401);
  });

  it("scopes an organizer's event list to their own events", async () => {
    const other = await db.event.create({
      data: {
        organizerId: organizerB.id,
        regionId: "id",
        venueId: venue.id,
        title: `Guard Test Other ${stamp}`,
        slug: `guard-other-${stamp}`,
        description: "Owned by organizer B.",
        startDate: new Date("2027-11-01T09:00:00.000Z"),
        endDate: new Date("2027-11-02T18:00:00.000Z"),
      },
    });
    eventIds.push(other.id);

    const res = await getEvents(new Request(EVENTS_URL, { headers: asOrganizer(organizerA) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.events.length).toBeGreaterThan(0);
    expect(json.events.every((e: any) => e.organizerId === organizerA.id)).toBe(true);
    expect(json.events.some((e: any) => e.id === other.id)).toBe(false);
  });

  it("rejects an unauthenticated booth creation with 401", async () => {
    const res = await createBooth(
      new Request(BOOTHS_URL, {
        method: "POST",
        body: JSON.stringify({ eventId: "any", boothNumber: "A1", hallName: "Hall A" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated admin event deletion with 401", async () => {
    const res = await deleteEvent(
      new Request("http://localhost/api/admin/events/any", { method: "DELETE" }),
      { params: Promise.resolve({ id: "any" }) }
    );
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated admin user list with 401", async () => {
    const res = await listUsers(new Request(USERS_URL));
    expect(res.status).toBe(401);
  });

  it("lets a real session outrank a forged role cookie", async () => {
    const token = await createSession(attendee.id);
    const res = await listUsers(
      new Request(USERS_URL, {
        headers: { Cookie: `xpo_session=${token}; xpo_role=ADMIN` },
      })
    );
    expect(res.status).toBe(403);
  });
});
