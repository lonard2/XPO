import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  GET as listUpdates,
  POST as createUpdate,
} from "@/app/api/organizer/events/[id]/updates/route";
import {
  PATCH as editUpdate,
  DELETE as deleteUpdate,
} from "@/app/api/organizer/events/[id]/updates/[updateId]/route";

function req(
  url: string,
  method: string,
  body: unknown,
  role?: string,
  userId?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (role) headers.Cookie = `xpo_role=${role}`;
  if (userId) {
    headers["x-xpo-user-role"] = role ?? "ORGANIZER";
    headers["x-xpo-user-id"] = userId;
  }
  return new NextRequest(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("Organizer API: Event updates CRUD and ownership", () => {
  let ownedEventId: string;
  let ownedOrganizerId: string;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const seed = await db.event.findFirst({
      where: { organizerId: { not: null } },
      select: { id: true, organizerId: true },
    });
    if (!seed?.organizerId) throw new Error("owned seeded event required");
    ownedEventId = seed.id;
    ownedOrganizerId = seed.organizerId;
  });

  afterAll(async () => {
    await db.eventUpdate.deleteMany({ where: { id: { in: createdIds } } });
    await db.$disconnect();
  });

  const owner = (url: string, method: string, body: unknown) =>
    req(url, method, body, "ORGANIZER", ownedOrganizerId);

  it("denies strangers and validates input", async () => {
    const base = `http://localhost:3000/api/organizer/events/${ownedEventId}/updates`;

    const stranger = await createUpdate(
      req(base, "POST", { title: "Hi", body: "There." }, "ORGANIZER", "nobody"),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(stranger.status).toBe(403);

    const invalid = await createUpdate(
      owner(base, "POST", { title: "", body: "There." }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(invalid.status).toBe(400);
  });

  it("creates drafts for the owner and lists them back", async () => {
    const base = `http://localhost:3000/api/organizer/events/${ownedEventId}/updates`;
    const created = await createUpdate(
      owner(base, "POST", { title: "Doors open early", body: "Gates at 8." }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(created.status).toBe(200);
    const json = await created.json();
    expect(json.success).toBe(true);
    expect(json.update.status).toBe("DRAFT");
    createdIds.push(json.update.id);

    const listed = await listUpdates(
      owner(base, "GET", undefined),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(listed.status).toBe(200);
    const listedJson = await listed.json();
    expect(listedJson.updates.map((u: { id: string }) => u.id)).toContain(
      json.update.id
    );
  });

  it("reverts approved copy to draft on body edit", async () => {
    const base = `http://localhost:3000/api/organizer/events/${ownedEventId}/updates`;
    const created = await createUpdate(
      owner(base, "POST", { title: "Lineup drop", body: "Acts announced." }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    const row = await created.json();
    createdIds.push(row.update.id);
    await db.eventUpdate.update({
      where: { id: row.update.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });
    await db.homepageNewsSlot.create({
      data: { updateId: row.update.id, regionId: "id", position: 3 },
    });

    const edited = await editUpdate(
      owner(`${base}/${row.update.id}`, "PATCH", { body: "More acts announced." }),
      {
        params: Promise.resolve({ id: ownedEventId, updateId: row.update.id }),
      }
    );
    expect(edited.status).toBe(200);
    const editedJson = await edited.json();
    expect(editedJson.update.status).toBe("DRAFT");
    expect(editedJson.update.approvedAt).toBeNull();
    // Revert evicts the slot in the same transaction: no draft on the rail.
    expect(
      await db.homepageNewsSlot.count({ where: { updateId: row.update.id } })
    ).toBe(0);
  });

  it("denies another organizer and deletes with slot eviction", async () => {
    const base = `http://localhost:3000/api/organizer/events/${ownedEventId}/updates`;
    const created = await createUpdate(
      owner(base, "POST", { title: "To remove", body: "Gone soon." }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    const row = await created.json();

    const other = await editUpdate(
      req(`${base}/${row.update.id}`, "PATCH", { title: "Hijack" }, "ORGANIZER", "someone-else"),
      {
        params: Promise.resolve({ id: ownedEventId, updateId: row.update.id }),
      }
    );
    expect(other.status).toBe(403);

    await db.homepageNewsSlot.create({
      data: { updateId: row.update.id, regionId: "id", position: 0 },
    });
    const removed = await deleteUpdate(
      owner(`${base}/${row.update.id}`, "DELETE", undefined),
      {
        params: Promise.resolve({ id: ownedEventId, updateId: row.update.id }),
      }
    );
    expect(removed.status).toBe(200);
    expect(
      await db.homepageNewsSlot.count({ where: { updateId: row.update.id } })
    ).toBe(0);
  });
});
