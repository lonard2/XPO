import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { POST as createVenueRoute } from "@/app/api/admin/venues/route";
import { PUT as updateVenueRoute, DELETE as deleteVenueRoute } from "@/app/api/admin/venues/[id]/route";
import { POST as createEventRoute } from "@/app/api/organizer/events/route";
import { DELETE as deleteEventRoute } from "@/app/api/admin/events/[id]/route";
import { POST as createBoothRoute } from "@/app/api/organizer/booths/route";

const adminHeaders = { "Content-Type": "application/json", Cookie: "xpo_role=ADMIN" };
const stamp = Date.now();
const venueName = `Audit Probe Venue ${stamp}`;

function req(url: string, method: string, body?: any, headers: any = adminHeaders) {
  return new NextRequest(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function auditFor(entityId: string) {
  return db.auditLog.findMany({ where: { entityId } });
}

describe("Mutation audit instrumentation", () => {
  let venueId: string;
  let eventId: string;
  let boothId: string | undefined;

  afterAll(async () => {
    await db.auditLog.deleteMany({
      where: { OR: [{ entityId: venueId }, { entityId: eventId }, { entityId: boothId }] },
    }).catch(() => {});
    await db.$disconnect();
  });

  it("audits venue create, update, and delete", async () => {
    const createRes = await createVenueRoute(
      req("http://localhost:3000/api/admin/venues", "POST", {
        name: venueName,
        regionId: "id",
        city: "Jakarta",
        address: "Probe Street 1",
      })
    );
    expect(createRes.status).toBe(201);
    venueId = (await createRes.json()).venue.id;

    const updateRes = await updateVenueRoute(
      req(`http://localhost:3000/api/admin/venues/${venueId}`, "PUT", { city: "Bandung" }),
      { params: Promise.resolve({ id: venueId }) } as any
    );
    expect(updateRes.status).toBe(200);

    const deleteRes = await deleteVenueRoute(
      req(`http://localhost:3000/api/admin/venues/${venueId}`, "DELETE"),
      { params: Promise.resolve({ id: venueId }) } as any
    );
    expect(deleteRes.status).toBe(200);

    const rows = await auditFor(venueId);
    const actions = rows.map((r) => r.action).sort();
    expect(actions).toEqual(["venue.create", "venue.delete", "venue.update"]);
    expect(rows.every((r) => r.actorRole === "ADMIN")).toBe(true);
  });

  it("audits event create, booth create, and event delete", async () => {
    const venue = await db.venue.findFirst();
    const createRes = await createEventRoute(
      req("http://localhost:3000/api/organizer/events", "POST", {
        title: `Audit Probe Expo ${stamp}`,
        slug: `audit-probe-expo-${stamp}`,
        description: "Audit instrumentation probe.",
        regionId: "id",
        venueId: venue!.id,
        startDate: "2027-01-01T09:00:00.000Z",
        endDate: "2027-01-02T18:00:00.000Z",
        ticketTiers: [],
      })
    );
    expect(createRes.status).toBe(201);
    eventId = (await createRes.json()).event.id;

    const boothRes = await createBoothRoute(
      req("http://localhost:3000/api/organizer/booths", "POST", {
        eventId,
        boothNumber: "H9-AUDIT",
        hallName: "Hall 9",
      })
    );
    expect(boothRes.status).toBe(201);
    boothId = (await boothRes.json()).booth.id;

    const deleteRes = await deleteEventRoute(
      req(`http://localhost:3000/api/admin/events/${eventId}`, "DELETE"),
      { params: Promise.resolve({ id: eventId }) } as any
    );
    expect(deleteRes.status).toBe(200);

    const eventRows = await auditFor(eventId);
    expect(eventRows.map((r) => r.action).sort()).toEqual(["event.create", "event.delete"]);
    const boothRows = await auditFor(boothId);
    expect(boothRows.map((r) => r.action)).toEqual(["booth.create"]);
  });
});
