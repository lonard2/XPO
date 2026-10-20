import { describe, it, expect } from "vitest";
import { GET as metricsRoute } from "@/app/api/admin/metrics/route";

describe("Admin metrics endpoint", () => {
  it("serves platform counts to admins", async () => {
    const res = await metricsRoute(
      new Request("http://localhost:3000/api/admin/metrics", {
        headers: { Cookie: "xpo_role=ADMIN" },
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.users.total).toBeGreaterThan(0);
    expect(json.events.total).toBeGreaterThan(0);
    expect(json.bookings.total).toBeGreaterThanOrEqual(0);
    expect(typeof json.booths.occupancyPct).toBe("number");
    expect(typeof json.sessions.active).toBe("number");
    expect(typeof json.audit24h).toBe("number");
  });

  it("refuses non-admins with 403", async () => {
    const res = await metricsRoute(
      new Request("http://localhost:3000/api/admin/metrics", {
        headers: { Cookie: "xpo_role=ORGANIZER" },
      })
    );
    expect(res.status).toBe(403);
  });
});
