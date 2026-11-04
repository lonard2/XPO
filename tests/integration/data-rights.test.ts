import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { GET as exportProfile } from "@/app/api/profile/export/route";
import { DELETE as eraseProfile } from "@/app/api/profile/erase/route";
import { GET as runRetention } from "@/app/api/cron/retention/route";

const PROFILE_URL = "http://localhost/api/profile";

describe("data rights", () => {
  const stamp = Date.now();
  let user: any;
  let other: any;
  let event: any;
  let tier: any;
  let booking: any;

  const asUser = (id: string) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ATTENDEE",
    "x-xpo-user-id": id,
  });

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    user = await db.user.create({
      data: {
        email: `erase-me-${stamp}@example.com`,
        name: "Erase Me",
        role: "ATTENDEE",
        organization: "Forget Corp",
        interestsJson: JSON.stringify(["TECH_DEV_SUMMIT"]),
      },
    });
    other = await db.user.create({
      data: { email: `erase-other-${stamp}@example.com`, name: "Other", role: "ATTENDEE" },
    });

    event = await db.event.create({
      data: {
        regionId: "id",
        venueId: venue!.id,
        title: `Erase Event ${stamp}`,
        slug: `erase-event-${stamp}`,
        description: "Erasure coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    tier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 2 },
    });
    booking = await db.booking.create({
      data: {
        userId: user.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Erase Me",
        attendeeEmail: `erase-me-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-ERASE-${stamp}`,
      },
    });
    await db.booking.create({
      data: {
        userId: other.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Other",
        attendeeEmail: `erase-other-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-ERASE-OTHER-${stamp}`,
      },
    });
    await db.meetingRequest.create({
      data: {
        eventId: event.id,
        type: "RFQ",
        requesterName: "Erase Me",
        requesterEmail: `erase-me-${stamp}@example.com`,
        requesterId: user.id,
      },
    });
    await db.waitlistEntry.create({
      data: {
        eventId: event.id,
        ticketTierId: tier.id,
        name: "Erase Me",
        email: `erase-me-${stamp}@example.com`,
      },
    });
    await db.session.create({
      data: {
        tokenHash: `erase-token-${stamp}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
  });

  afterAll(async () => {
    await db.meetingRequest.deleteMany({ where: { eventId: event?.id } });
    await db.waitlistEntry.deleteMany({ where: { eventId: event?.id } });
    await db.booking.deleteMany({ where: { eventId: event?.id } });
    await db.ticketTier.deleteMany({ where: { eventId: event?.id } });
    await db.event.deleteMany({ where: { id: event?.id } });
    await db.session.deleteMany({ where: { userId: user?.id } });
    await db.user.deleteMany({ where: { id: { in: [user?.id, other?.id].filter(Boolean) as string[] } } });
    await db.$disconnect();
  });

  it("rejects anonymous export and erasure with 401", async () => {
    expect((await exportProfile(new Request(`${PROFILE_URL}/export`))).status).toBe(401);
    expect(
      (
        await eraseProfile(
          new Request(PROFILE_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirm: "DELETE" }),
          })
        )
      ).status
    ).toBe(401);
  });

  it("exports only the caller's own data", async () => {
    const res = await exportProfile(
      new Request(`${PROFILE_URL}/export`, { headers: asUser(user.id) })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toContain("attachment");
    const json = await res.json();
    expect(json.profile.email).toBe(`erase-me-${stamp}@example.com`);
    expect(json.profile.interests).toEqual(["TECH_DEV_SUMMIT"]);
    expect(json.bookings).toHaveLength(1);
    expect(json.bookings[0].id).toBe(booking.id);
    expect(json.meetingRequests).toHaveLength(1);
    expect(json.waitlistEntries).toHaveLength(1);
  });

  it("refuses erasure without the explicit confirmation", async () => {
    for (const body of [{}, { confirm: "yes" }, { confirm: "delete" }]) {
      const res = await eraseProfile(
        new Request(PROFILE_URL, {
          method: "DELETE",
          headers: asUser(user.id),
          body: JSON.stringify(body),
        })
      );
      expect(res.status).toBe(400);
    }
    expect((await db.user.findUnique({ where: { id: user.id } }))?.name).toBe("Erase Me");
  });

  it("scrubs personal data while keeping operational rows", async () => {
    const res = await eraseProfile(
      new Request(PROFILE_URL, {
        method: "DELETE",
        headers: asUser(user.id),
        body: JSON.stringify({ confirm: "DELETE" }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.erased).toMatchObject({
      bookings: 1,
      meetingRequests: 1,
      waitlistEntries: 1,
    });

    // Booking rows stay (organizer truth) with scrubbed holder fields.
    const kept = await db.booking.findUnique({ where: { id: booking.id } });
    expect(kept).toBeDefined();
    expect(kept?.attendeeName).toBe("Deleted User");
    expect(kept?.attendeeEmail).toContain("deleted.local");

    // Requests unlink and scrub; the other delegate is untouched.
    const requests = await db.meetingRequest.findMany({ where: { eventId: event.id } });
    expect(requests).toHaveLength(1);
    expect(requests[0].requesterId).toBeNull();
    expect(requests[0].requesterEmail).toContain("deleted.local");

    const waitlist = await db.waitlistEntry.findMany({ where: { eventId: event.id } });
    expect(waitlist[0].email).toContain("deleted.local");

    // Sessions die (instant logout); the user row anonymizes in place.
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    const scrubbed = await db.user.findUnique({ where: { id: user.id } });
    expect(scrubbed?.name).toBe("Deleted User");
    expect(scrubbed?.organization).toBeNull();
    expect(scrubbed?.passwordHash).toBeNull();
    expect(scrubbed?.interestsJson).toBe("[]");

    const otherBooking = await db.booking.findFirst({
      where: { eventId: event.id, userId: other.id },
    });
    expect(otherBooking?.attendeeName).toBe("Other");
  });
});

describe("audit retention", () => {
  const OLD_ACTION = "retention-probe-old";
  const NEW_ACTION = "retention-probe-new";

  beforeAll(async () => {
    await db.$connect();
    process.env.CRON_SECRET = "test-retention-secret";
    await db.auditLog.create({
      data: { action: OLD_ACTION, entity: "test", createdAt: new Date(Date.now() - 60 * 86400_000) },
    });
    await db.auditLog.create({ data: { action: NEW_ACTION, entity: "test" } });
  });

  afterAll(async () => {
    await db.auditLog.deleteMany({ where: { action: { in: [OLD_ACTION, NEW_ACTION] } } });
    delete process.env.CRON_SECRET;
    delete process.env.AUDIT_RETENTION_DAYS;
    await db.$disconnect();
  });

  const call = (authorized = true) =>
    runRetention(
      new Request("http://localhost/api/cron/retention", {
        headers: authorized ? { Authorization: "Bearer test-retention-secret" } : {},
      })
    );

  it("rejects calls without the secret", async () => {
    expect((await call(false)).status).toBe(401);
  });

  it("dry-runs when no window is configured and deletes nothing", async () => {
    delete process.env.AUDIT_RETENTION_DAYS;
    const res = await call();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.dryRun).toBe(true);
    expect(json.deleted).toBe(0);
    expect(json.wouldDelete).toBeGreaterThanOrEqual(2);
    expect(await db.auditLog.count({ where: { action: OLD_ACTION } })).toBe(1);
  });

  it("deletes only rows past the window once configured", async () => {
    process.env.AUDIT_RETENTION_DAYS = "30";
    const res = await call();
    const json = await res.json();
    expect(json.dryRun).toBe(false);
    expect(json.deleted).toBeGreaterThanOrEqual(1);
    expect(await db.auditLog.count({ where: { action: OLD_ACTION } })).toBe(0);
    expect(await db.auditLog.count({ where: { action: NEW_ACTION } })).toBe(1);
    delete process.env.AUDIT_RETENTION_DAYS;
  });
});
