import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { GET as queueUpdates } from "@/app/api/admin/updates/route";
import { PATCH as moderateUpdate } from "@/app/api/admin/updates/[updateId]/route";
import { POST as authorUpdate } from "@/app/api/admin/events/[id]/updates/route";
import {
  GET as listSlots,
  PUT as saveSlots,
} from "@/app/api/admin/news-slots/route";

describe("Admin API: News review, authorship, and slots", () => {
  const adminHeaders = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ADMIN",
  };
  const organizerHeaders = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
  };
  const plainHeaders = { "Content-Type": "application/json" };

  let eventId: string;
  let draftId: string;
  let approvedId: string;
  const slotRegion = "id";

  const call = (
    handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
    url: string,
    method: string,
    body: unknown,
    headers: Record<string, string>,
    params: Record<string, string>
  ) =>
    handler(
      new Request(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      { params: Promise.resolve(params) }
    );

  beforeAll(async () => {
    await db.$connect();
    const event = await db.event.findFirst({
      orderBy: { startDate: "asc" },
    });
    if (!event) throw new Error("seeded event required");
    eventId = event.id;
    const draft = await db.eventUpdate.create({
      data: { eventId, title: "Pending doors note", body: "Gates move an hour." },
    });
    const approved = await db.eventUpdate.create({
      data: {
        eventId,
        title: "Lineup is live",
        body: "Full program published.",
        status: "APPROVED",
        approvedBy: "admin",
        approvedAt: new Date(),
      },
    });
    draftId = draft.id;
    approvedId = approved.id;
  });

  afterAll(async () => {
    await db.homepageNewsSlot.deleteMany({
      where: { update: { eventId } },
    });
    await db.eventUpdate.deleteMany({ where: { eventId } });
    await db.$disconnect();
  });

  it("denies anonymous and non-admin callers on all four routes", async () => {
    const anonQueue = await call(queueUpdates, "http://localhost:3000/api/admin/updates?status=DRAFT", "GET", undefined, plainHeaders, {});
    expect(anonQueue.status).toBe(401);

    const orgQueue = await call(queueUpdates, "http://localhost:3000/api/admin/updates?status=DRAFT", "GET", undefined, organizerHeaders, {});
    expect(orgQueue.status).toBe(403);

    const orgApprove = await call(moderateUpdate, `http://localhost:3000/api/admin/updates/${draftId}`, "PATCH", { approved: true }, organizerHeaders, { updateId: draftId });
    expect(orgApprove.status).toBe(403);

    const orgAuthor = await call(authorUpdate, `http://localhost:3000/api/admin/events/${eventId}/updates`, "POST", { title: "T", body: "B" }, organizerHeaders, { id: eventId });
    expect(orgAuthor.status).toBe(403);

    const orgSlots = await call(saveSlots, "http://localhost:3000/api/admin/news-slots", "PUT", { regionId: "id", slots: [] }, organizerHeaders, {});
    expect(orgSlots.status).toBe(403);
  });

  it("filters the review queue by status with event context", async () => {
    const res = await call(queueUpdates, "http://localhost:3000/api/admin/updates?status=DRAFT", "GET", undefined, adminHeaders, {});
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const ids = json.updates.map((u: { id: string }) => u.id);
    expect(ids).toContain(draftId);
    expect(ids).not.toContain(approvedId);
    expect(json.updates[0].event.title).toBeDefined();
  });

  it("approves with stamps and unapproves with slot eviction", async () => {
    const approve = await call(moderateUpdate, `http://localhost:3000/api/admin/updates/${draftId}`, "PATCH", { approved: true }, adminHeaders, { updateId: draftId });
    expect(approve.status).toBe(200);
    const approved = await approve.json();
    expect(approved.update.status).toBe("APPROVED");
    expect(approved.update.approvedBy).toBe("admin");
    expect(approved.update.approvedAt).not.toBeNull();

    await db.homepageNewsSlot.create({
      data: { updateId: draftId, regionId: slotRegion, position: 0 },
    });
    const unapprove = await call(moderateUpdate, `http://localhost:3000/api/admin/updates/${draftId}`, "PATCH", { approved: false }, adminHeaders, { updateId: draftId });
    expect(unapprove.status).toBe(200);
    const reverted = await unapprove.json();
    expect(reverted.update.status).toBe("DRAFT");
    expect(reverted.update.approvedAt).toBeNull();
    expect(
      await db.homepageNewsSlot.count({ where: { updateId: draftId } })
    ).toBe(0);
  });

  it("authors approved updates on ownerless events", async () => {
    const res = await call(authorUpdate, `http://localhost:3000/api/admin/events/${eventId}/updates`, "POST", { title: "Editorial note", body: "Curated highlight." }, adminHeaders, { id: eventId });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.update.status).toBe("APPROVED");
    await db.eventUpdate.delete({ where: { id: json.update.id } });
  });

  it("orders slots transactionally and rejects bad slot writes", async () => {
    const second = await db.eventUpdate.create({
      data: { eventId, title: "Second", body: "More.", status: "APPROVED", approvedAt: new Date() },
    });

    const saved = await call(saveSlots, "http://localhost:3000/api/admin/news-slots", "PUT", { regionId: slotRegion, slots: [second.id, approvedId] }, adminHeaders, {});
    expect(saved.status).toBe(200);

    const listed = await call(listSlots, `http://localhost:3000/api/admin/news-slots?region=${slotRegion}`, "GET", undefined, adminHeaders, {});
    const listedJson = await listed.json();
    expect(listedJson.slots.map((s: { updateId: string }) => s.updateId)).toEqual([
      second.id,
      approvedId,
    ]);

    const tooMany = await call(saveSlots, "http://localhost:3000/api/admin/news-slots", "PUT", { regionId: slotRegion, slots: ["a", "b", "c", "d", "e", "f", "g"] }, adminHeaders, {});
    expect(tooMany.status).toBe(400);

    const unknown = await call(saveSlots, "http://localhost:3000/api/admin/news-slots", "PUT", { regionId: slotRegion, slots: ["nope-zzz"] }, adminHeaders, {});
    expect(unknown.status).toBe(404);

    const draftSlot = await db.eventUpdate.create({
      data: { eventId, title: "Drafty", body: "Not yet." },
    });
    const drafty = await call(saveSlots, "http://localhost:3000/api/admin/news-slots", "PUT", { regionId: slotRegion, slots: [draftSlot.id] }, adminHeaders, {});
    expect(drafty.status).toBe(400);

    await db.eventUpdate.deleteMany({ where: { id: { in: [second.id, draftSlot.id] } } });
  });
});
