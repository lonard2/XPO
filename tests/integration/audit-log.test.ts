import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { audit, recentAuditEntries } from "@/lib/observability/audit";

describe("Audit log", () => {
  const req = (cookie: string) =>
    new Request("http://localhost:3000/api/x", { headers: { Cookie: cookie } });

  afterAll(async () => {
    await db.auditLog.deleteMany({ where: { entityId: { startsWith: "audit-probe-" } } }).catch(() => {});
    await db.$disconnect();
  });

  it("records actor, action, entity, and metadata", async () => {
    await audit(req("xpo_role=ADMIN"), {
      action: "event.delete",
      entity: "event",
      entityId: "audit-probe-1",
      metadata: { title: "Probe Expo" },
    });
    const rows = await db.auditLog.findMany({ where: { entityId: "audit-probe-1" } });
    expect(rows.length).toBe(1);
    expect(rows[0].actorRole).toBe("ADMIN");
    expect(rows[0].action).toBe("event.delete");
    expect(rows[0].metadata).toContain("Probe Expo");
  });

  it("never throws, even with garbage input", async () => {
    await expect(
      audit(null as any, { action: "", entity: "", entityId: "" })
    ).resolves.toBeUndefined();
  });

  it("lists recent entries newest-first", async () => {
    await audit(req("xpo_role=ADMIN"), {
      action: "venue.update",
      entity: "venue",
      entityId: "audit-probe-2",
    });
    const rows = await recentAuditEntries(10);
    expect(rows.length).toBeGreaterThan(0);
    expect(new Date(rows[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(rows[rows.length - 1].createdAt).getTime()
    );
  });
});
