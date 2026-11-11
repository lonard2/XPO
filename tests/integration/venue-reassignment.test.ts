import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PUT as reassignVenue } from "@/app/api/organizer/events/[id]/venue/route";

function req(url: string, body: unknown, role?: string, userId?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (role) headers.Cookie = `xpo_role=${role}`;
  if (userId) {
    headers["x-xpo-user-role"] = role ?? "ORGANIZER";
    headers["x-xpo-user-id"] = userId;
  }
  return new NextRequest(url, { method: "PUT", headers, body: JSON.stringify(body) });
}

describe("Organizer API: venue reassignment", () => {
  let eventId: string;
  let organizerId: string;
  let original: {
    venueId: string;
    regionId: string;
    venueHallId: string | null;
    venueHallIds: string | null;
  };
  let targetVenue: { id: string; regionId: string; halls: Array<{ id: string }> };
  let emptyVenueId: string;
  let originalHallIds: string[];

  beforeAll(async () => {
    const event = await db.event.findFirst({
      where: { organizerId: { not: null } },
      include: { venue: { include: { halls: true } } },
    });
    if (!event?.organizerId) throw new Error("owned seeded event required");

    eventId = event.id;
    organizerId = event.organizerId;
    original = {
      venueId: event.venueId,
      regionId: event.regionId,
      venueHallId: event.venueHallId,
      venueHallIds: event.venueHallIds,
    };
    originalHallIds = event.venue.halls.map((h) => h.id);

    const venue = await db.venue.findFirst({
      where: {
        regionId: { not: event.regionId },
        halls: { some: {} },
      },
      include: { halls: true },
    });
    if (!venue) throw new Error("seeded venue in another region with halls required");
    targetVenue = { id: venue.id, regionId: venue.regionId, halls: venue.halls };

    const emptyVenue = await db.venue.create({
      data: {
        regionId: event.regionId,
        name: "Reassignment Empty Venue",
        slug: `reassignment-empty-${Date.now()}`,
        city: "Jakarta",
        address: "Test address",
        transitInfo: "Test transit",
        type: "COMMUNITY_HALL",
      },
      select: { id: true },
    });
    emptyVenueId = emptyVenue.id;
  });

  afterEach(async () => {
    await db.event.update({ where: { id: eventId }, data: original });
  });

  afterAll(async () => {
    await db.event.update({ where: { id: eventId }, data: original });
    await db.venue.delete({ where: { id: emptyVenueId } });
    await db.$disconnect();
  });

  it("moves the event to another region's venue and keeps the allocation inside it", async () => {
    const requested = targetVenue.halls.slice(0, 2).map((h) => h.id);
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: targetVenue.id,
        venueHallIds: requested,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.event.venueId).toBe(targetVenue.id);
    expect(body.event.regionId).toBe(targetVenue.regionId);
    expect(body.event.venueHallId).toBe(requested[0]);
    expect(JSON.parse(body.event.venueHallIds)).toEqual(requested);
    expect(body.event.venue.halls.length).toBe(targetVenue.halls.length);

    const log = await db.auditLog.findFirst({
      where: { action: "event.venue", entityId: eventId },
      orderBy: { createdAt: "desc" },
    });
    expect(log?.metadata ?? "").toContain(original.venueId);
  });

  it("rejects an allocation made only of the previous venue's spaces", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: targetVenue.id,
        venueHallIds: originalHallIds,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(400);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });

  it("rejects an unknown venue without writing", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: "does-not-exist",
        venueHallIds: originalHallIds,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(400);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });

  it("denies a caller who does not own the event", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: targetVenue.id,
        venueHallIds: [targetVenue.halls[0].id],
      }, "ORGANIZER", "someone-else"),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(403);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });

  it("rejects a venue with no spaces", async () => {
    const res = await reassignVenue(
      req(`http://localhost:3000/api/organizer/events/${eventId}/venue`, {
        venueId: emptyVenueId,
        venueHallIds: originalHallIds,
      }, "ORGANIZER", organizerId),
      { params: Promise.resolve({ id: eventId }) }
    );

    expect(res.status).toBe(400);
    const after = await db.event.findUnique({ where: { id: eventId } });
    expect(after?.venueId).toBe(original.venueId);
  });
});
