import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { detectAnomalies } from "@/lib/observability/anomalies";
import { GET as anomaliesRoute } from "@/app/api/admin/anomalies/route";

describe("Check-in anomaly feed", () => {
  let eventId: string;
  const stamp = Date.now();

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    const tier = await db.ticketTier.findFirst();
    const event = await db.event.create({
      data: {
        title: `Anomaly Probe Expo ${stamp}`,
        slug: `anomaly-probe-${stamp}`,
        description: "Anomaly detection probe.",
        regionId: "id",
        venueId: venue!.id,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
      },
    });
    eventId = event.id;
    const user = await db.user.findFirst();
    // Burst: 8 admissions inside the last hour against a quiet baseline.
    await db.booking.createMany({
      data: Array.from({ length: 8 }, (_, i) => ({
        id: `bk-anom-${stamp}-${i}`,
        userId: user!.id,
        eventId,
        ticketTierId: tier!.id,
        attendeeName: `Anomaly Buyer ${i}`,
        attendeeEmail: `anom-${stamp}-${i}@xpo.com`,
        qrCodeHash: `ANOM-HASH-${stamp}-${i}`,
        status: "CHECKED_IN",
        checkedInAt: new Date(Date.now() - i * 5 * 60000),
      })),
    });
    await db.auditLog.createMany({
      data: [0, 1].map((i) => ({
        action: "pass.override",
        entity: "booking",
        entityId: `bk-anom-${stamp}-${i}`,
        actorRole: "ORGANIZER",
      })),
    });
  });

  afterAll(async () => {
    await db.booking.deleteMany({ where: { eventId } }).catch(() => {});
    await db.auditLog.deleteMany({ where: { entityId: { startsWith: `bk-anom-${stamp}` } } }).catch(() => {});
    await db.event.delete({ where: { id: eventId } }).catch(() => {});
    await db.$disconnect();
  });

  it("flags admission velocity spikes against the trailing baseline", async () => {
    const signals = await detectAnomalies({ hoursBack: 24 });
    const spike = signals.find((s) => s.kind === "admission-spike" && s.eventId === eventId);
    expect(spike).toBeDefined();
    expect(spike!.lastHour).toBe(8);
  });

  it("surfaces override clusters from the audit trail", async () => {
    const signals = await detectAnomalies({ hoursBack: 24 });
    const cluster = signals.find((s) => s.kind === "override-cluster" && s.eventId === eventId);
    expect(cluster).toBeDefined();
  });

  it("serves the admin endpoint to admins and refuses others", async () => {
    const ok = await anomaliesRoute(
      new Request("http://localhost:3000/api/admin/anomalies", {
        headers: { Cookie: "xpo_role=ADMIN" },
      })
    );
    expect(ok.status).toBe(200);
    const json = await ok.json();
    expect(Array.isArray(json.signals)).toBe(true);

    const denied = await anomaliesRoute(
      new Request("http://localhost:3000/api/admin/anomalies", {
        headers: { Cookie: "xpo_role=ORGANIZER" },
      })
    );
    expect(denied.status).toBe(403);
  });
});
