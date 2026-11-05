import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  GET as listRows,
  POST as createRow,
} from "@/app/api/admin/homepage-rows/route";
import {
  PUT as updateRow,
  DELETE as deleteRow,
} from "@/app/api/admin/homepage-rows/[id]/route";
import { PUT as reorderRows } from "@/app/api/admin/homepage-rows/reorder/route";

describe("Admin API: homepage rows", () => {
  const admin = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ADMIN",
  };
  const organizer = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
  };

  let publicIds: string[] = [];
  let hiddenId: string;
  const createdIds: string[] = [];

  const call = (
    handler: (req: Request, ctx?: never) => Promise<Response>,
    url: string,
    method: string,
    body: unknown,
    headers: Record<string, string>
  ) =>
    handler(
      new Request(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }) as never,
      undefined as never
    );

  const callById = (
    handler: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>,
    url: string,
    method: string,
    body: unknown,
    headers: Record<string, string>,
    id: string
  ) =>
    handler(
      new Request(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }) as never,
      { params: Promise.resolve({ id }) }
    );

  beforeAll(async () => {
    await db.$connect();
    const events = await db.event.findMany({
      where: { visibility: "PUBLIC", endDate: { gte: new Date() } },
      select: { id: true },
      take: 4,
      orderBy: { startDate: "asc" },
    });
    publicIds = events.map((e) => e.id);
    if (publicIds.length < 3) throw new Error("need three public events");

    const venue = await db.venue.findFirst({ select: { id: true } });
    if (!venue) throw new Error("seeded venue required");
    const hidden = await db.event.create({
      data: {
        title: "Hidden Row Probe",
        slug: `hidden-row-probe-${Date.now()}`,
        description: "Hidden.",
        venueId: venue.id,
        regionId: "id",
        startDate: new Date(Date.now() + 86400000 * 30),
        endDate: new Date(Date.now() + 86400000 * 31),
        archetype: "INDUSTRIAL_B2B",
        visibility: "HIDDEN",
      },
    });
    hiddenId = hidden.id;
  });

  afterAll(async () => {
    await db.homepageRow.deleteMany({ where: { id: { in: createdIds } } });
    await db.event.deleteMany({ where: { id: hiddenId } });
    await db.$disconnect();
  });

  it("denies anonymous and non-admin callers", async () => {
    const anon = await call(
      listRows,
      "http://localhost:3000/api/admin/homepage-rows?region=id",
      "GET",
      undefined,
      { "Content-Type": "application/json" }
    );
    expect(anon.status).toBe(401);

    const org = await call(
      listRows,
      "http://localhost:3000/api/admin/homepage-rows?region=id",
      "GET",
      undefined,
      organizer
    );
    expect(org.status).toBe(403);
  });

  it("creates a row at the end of its scope and lists candidates", async () => {
    const res = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      {
        title: "Energy transition week",
        subtitle: "Grids and storage",
        regionId: "id",
        eventIds: publicIds.slice(0, 2),
      },
      admin
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.row.position).toBeGreaterThanOrEqual(0);
    createdIds.push(json.row.id);

    const list = await call(
      listRows,
      "http://localhost:3000/api/admin/homepage-rows?region=id",
      "GET",
      undefined,
      admin
    );
    const listed = await list.json();
    expect(listed.rows.map((r: { id: string }) => r.id)).toContain(json.row.id);
    expect(Array.isArray(listed.candidates)).toBe(true);
    expect(listed.candidates.map((c: { id: string }) => c.id)).not.toContain(
      hiddenId
    );
  });

  it("rejects hidden events, overlong copy, and too many ids", async () => {
    const hidden = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      { title: "Hidden pick", regionId: "id", eventIds: [hiddenId] },
      admin
    );
    expect(hidden.status).toBe(400);

    const longTitle = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      { title: "x".repeat(81), regionId: "id", eventIds: [] },
      admin
    );
    expect(longTitle.status).toBe(400);

    const tooMany = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      {
        title: "Too many",
        regionId: "id",
        eventIds: Array.from({ length: 9 }, (_, i) => publicIds[i % publicIds.length]),
      },
      admin
    );
    expect(tooMany.status).toBe(400);
  });

  it("reorders a scope and rejects ids outside it", async () => {
    const first = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      { title: "First", regionId: "id", eventIds: [publicIds[0]] },
      admin
    );
    const second = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      { title: "Second", regionId: "id", eventIds: [publicIds[1]] },
      admin
    );
    const a = (await first.json()).row;
    const b = (await second.json()).row;
    createdIds.push(a.id, b.id);

    const reordered = await call(
      reorderRows,
      "http://localhost:3000/api/admin/homepage-rows/reorder",
      "PUT",
      { regionId: "id", orderedIds: [b.id, a.id] },
      admin
    );
    expect(reordered.status).toBe(200);
    const reorderedJson = await reordered.json();
    expect(reorderedJson.rows.map((r: { id: string }) => r.id).slice(0, 2)).toEqual([
      b.id,
      a.id,
    ]);

    const foreign = await call(
      reorderRows,
      "http://localhost:3000/api/admin/homepage-rows/reorder",
      "PUT",
      { regionId: "jp", orderedIds: [a.id] },
      admin
    );
    expect(foreign.status).toBe(400);
  });

  it("toggles isActive and keeps omitted fields unchanged on partial updates", async () => {
    const created = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      {
        title: "Toggle probe",
        subtitle: "Keep me",
        regionId: "id",
        eventIds: [publicIds[0]],
      },
      admin
    );
    const row = (await created.json()).row;
    createdIds.push(row.id);

    const hidden = await callById(
      updateRow,
      `http://localhost:3000/api/admin/homepage-rows/${row.id}`,
      "PUT",
      {
        title: "Toggle probe",
        eventIds: [publicIds[0]],
        isActive: false,
      },
      admin,
      row.id
    );
    expect(hidden.status).toBe(200);
    const hiddenJson = await hidden.json();
    expect(hiddenJson.row.isActive).toBe(false);
    // Omitted region and subtitle survive a partial update.
    expect(hiddenJson.row.regionId).toBe("id");
    expect(hiddenJson.row.subtitle).toBe("Keep me");
  });

  it("moves a row between scopes and deletes it", async () => {
    const created = await call(
      createRow,
      "http://localhost:3000/api/admin/homepage-rows",
      "POST",
      { title: "Movable", regionId: "id", eventIds: [publicIds[0]] },
      admin
    );
    const row = (await created.json()).row;
    createdIds.push(row.id);

    const moved = await callById(
      updateRow,
      `http://localhost:3000/api/admin/homepage-rows/${row.id}`,
      "PUT",
      { title: "Movable", regionId: null, eventIds: [publicIds[0]] },
      admin,
      row.id
    );
    expect(moved.status).toBe(200);
    expect((await moved.json()).row.regionId).toBeNull();

    const removed = await callById(
      deleteRow,
      `http://localhost:3000/api/admin/homepage-rows/${row.id}`,
      "DELETE",
      undefined,
      admin,
      row.id
    );
    expect(removed.status).toBe(200);
    expect(
      await db.homepageRow.count({ where: { id: row.id } })
    ).toBe(0);
  });
});
