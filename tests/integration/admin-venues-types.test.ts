import { describe, it, expect, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { POST as createVenue } from "@/app/api/admin/venues/route";
import { PUT as updateVenue } from "@/app/api/admin/venues/[id]/route";

function req(url: string, method: string, body: unknown) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const createdIds: string[] = [];

function create(body: Record<string, unknown>) {
  return createVenue(
    req("http://localhost:3000/api/admin/venues", "POST", {
      regionId: "id",
      city: "Jakarta",
      address: "Probe Street 1",
      ...body,
    })
  );
}

describe("Admin venues: types and space kinds", () => {
  afterAll(async () => {
    if (createdIds.length > 0) {
      await db.venue.deleteMany({ where: { id: { in: createdIds } } });
    }
    await db.$disconnect();
  });

  it("creates a mall with an atrium and a venue-level capacity", async () => {
    const res = await create({
      name: `Probe Mall ${Date.now()}`,
      type: "MALL",
      capacity: 1200,
      halls: [{ name: "Atrium Level 1", kind: "ATRIUM", capacity: 1200 }],
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    createdIds.push(json.venue.id);
    expect(json.venue.type).toBe("MALL");
    expect(json.venue.capacity).toBe(1200);
    expect(json.venue.halls[0].kind).toBe("ATRIUM");
  });

  it("creates an outdoor ground with a field space", async () => {
    const res = await create({
      name: `Probe Ground ${Date.now()}`,
      type: "OUTDOOR",
      halls: [{ name: "North Lawn", kind: "FIELD", capacity: 4000 }],
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    createdIds.push(json.venue.id);
    expect(json.venue.type).toBe("OUTDOOR");
    expect(json.venue.halls[0].kind).toBe("FIELD");
  });

  it("rejects a field venue type and an unknown space kind", async () => {
    const badType = await create({
      name: `Probe Bad Type ${Date.now()}`,
      type: "FIELD",
      halls: [{ name: "Field", kind: "FIELD" }],
    });
    expect(badType.status).toBe(400);

    const badKind = await create({
      name: `Probe Bad Kind ${Date.now()}`,
      type: "MALL",
      halls: [{ name: "Plaza", kind: "PLAZA" }],
    });
    expect(badKind.status).toBe(400);
  });

  it("preserves a field kind on a partial hall update", async () => {
    const created = await create({
      name: `Probe Partial ${Date.now()}`,
      type: "OUTDOOR",
      halls: [{ name: "Probe Field", kind: "FIELD" }],
    });
    const createdJson = await created.json();
    createdIds.push(createdJson.venue.id);
    const hallId = createdJson.venue.halls[0].id;

    const updated = await updateVenue(
      req(
        `http://localhost:3000/api/admin/venues/${createdJson.venue.id}`,
        "PUT",
        {
          halls: [{ id: hallId, name: "Probe Field" }],
        }
      ),
      { params: Promise.resolve({ id: createdJson.venue.id }) }
    );

    expect(updated.status).toBe(200);
    const updatedJson = await updated.json();
    expect(updatedJson.venue.halls[0].kind).toBe("FIELD");
    expect(updatedJson.venue.type).toBe("OUTDOOR");
  });
});
