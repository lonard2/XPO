import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/sessionStore";
import { PATCH as updateBoothRoute } from "@/app/api/organizer/booths/route";

describe("Session-first caller cutover", () => {
  let ownerId: string;
  let strangerId: string;
  let eventId: string;
  let boothId: string;

  beforeAll(async () => {
    await db.$connect();
    const stamp = Date.now();
    const owner = await db.user.create({
      data: { email: `caller-owner-${stamp}@xpo.com`, name: "Caller Owner", role: "ORGANIZER" },
    });
    const stranger = await db.user.create({
      data: { email: `caller-stranger-${stamp}@xpo.com`, name: "Caller Stranger", role: "ORGANIZER" },
    });
    ownerId = owner.id;
    strangerId = stranger.id;
    const venue = await db.venue.findFirst();
    const event = await db.event.create({
      data: {
        title: `Caller Cutover Expo ${stamp}`,
        slug: `caller-cutover-${stamp}`,
        description: "Ownership cutover probe.",
        regionId: "id",
        venueId: venue!.id,
        organizerId: ownerId,
        startDate: new Date("2027-01-01"),
        endDate: new Date("2027-01-02"),
      },
    });
    eventId = event.id;
    const booth = await db.boothTenant.create({
      data: { eventId, boothNumber: "H9-CUT", hallName: "Hall 9", companyName: "Cutover Co" },
    });
    boothId = booth.id;
  });

  afterAll(async () => {
    await db.boothTenant.deleteMany({ where: { eventId } }).catch(() => {});
    await db.event.delete({ where: { id: eventId } }).catch(() => {});
    await db.session.deleteMany({ where: { userId: { in: [ownerId, strangerId] } } }).catch(() => {});
    await db.user.deleteMany({ where: { id: { in: [ownerId, strangerId] } } }).catch(() => {});
    await db.$disconnect();
  });

  function patchReq(cookie: string, company: string) {
    return new Request("http://localhost:3000/api/organizer/booths", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ id: boothId, companyName: company }),
    });
  }

  it("authenticates mutations from a session cookie with no role cookie", async () => {
    const token = await createSession(ownerId, {});
    const res = await updateBoothRoute(patchReq(`xpo_session=${token}`, "Session Authed Co"));
    expect(res.status).toBe(200);
  });

  it("rejects a non-owner session with 403", async () => {
    const token = await createSession(strangerId, {});
    const res = await updateBoothRoute(patchReq(`xpo_session=${token}`, "Intruder Co"));
    expect(res.status).toBe(403);
  });

  it("rejects demo cookies when demo auth is disabled", async () => {
    const prev = process.env.ALLOW_DEMO_AUTH;
    process.env.ALLOW_DEMO_AUTH = "false";
    try {
      const res = await updateBoothRoute(
        patchReq(`xpo_role=ADMIN`, "Demo Admin Co")
      );
      expect(res.status).toBe(403);
    } finally {
      if (prev === undefined) delete process.env.ALLOW_DEMO_AUTH;
      else process.env.ALLOW_DEMO_AUTH = prev;
    }
  });
});
