import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resetRateLimits } from "@/lib/api/rateLimit";
import { POST as createEvent } from "@/app/api/organizer/events/route";
import { POST as generateReport } from "@/app/api/ai/reports/route";

describe("rate limit headers", () => {
  let venueId = "";
  const createdEventIds: string[] = [];
  const adminHeaders = { "Content-Type": "application/json", Cookie: "xpo_role=ADMIN" };

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();
    venueId = venue!.id;
  });

  beforeEach(() => {
    resetRateLimits();
  });

  afterAll(async () => {
    if (createdEventIds.length) {
      await db.event.deleteMany({ where: { id: { in: createdEventIds } } });
    }
    await db.$disconnect();
  });

  it("emits limit headers on a successful event creation", async () => {
    const res = await createEvent(
      new NextRequest("http://localhost/api/organizer/events", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          title: "Rate Header Probe",
          description: "probe",
          pageSize: "LARGE",
          regionId: "id",
          venueId,
          startDate: "2027-12-01T09:00:00.000Z",
          endDate: "2027-12-02T18:00:00.000Z",
          ticketTiers: [],
        }),
      })
    );

    expect(res.status).toBe(201);
    expect(res.headers.get("x-ratelimit-limit")).toBe("30");
    expect(Number(res.headers.get("x-ratelimit-remaining"))).toBeGreaterThanOrEqual(0);
    expect(Number(res.headers.get("x-ratelimit-reset"))).toBeGreaterThan(0);

    const json = await res.json();
    createdEventIds.push(json.event.id);
  });

  it("returns 429 with headers once the report limit is spent", async () => {
    let last: Response | null = null;
    for (let i = 0; i < 11; i += 1) {
      last = await generateReport(
        new NextRequest("http://localhost/api/ai/reports", {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({}),
        })
      );
    }

    expect(last?.status).toBe(429);
    expect(last?.headers.get("x-ratelimit-limit")).toBe("10");
    expect(last?.headers.get("x-ratelimit-remaining")).toBe("0");
    expect(last?.headers.get("retry-after")).toBeTruthy();
  });
});
