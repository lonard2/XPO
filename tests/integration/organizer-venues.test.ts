import { describe, it, expect } from "vitest";
import { GET as venuesRoute } from "@/app/api/organizer/venues/route";

describe("Organizer venue directory", () => {
  it("lists real venues with halls and totals", async () => {
    const res = await venuesRoute(
      new Request("http://localhost:3000/api/organizer/venues")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.total).toBeGreaterThan(4);
    expect(json.venues.length).toBeGreaterThan(4);
    const jiexpo = json.venues.find((v: any) => v.slug === "jiexpo-kemayoran");
    expect(jiexpo).toBeDefined();
    expect(jiexpo.halls.length).toBeGreaterThan(0);
    expect(jiexpo.halls[0].id).toBeDefined();
  });

  it("filters by region and bounds pages", async () => {
    const res = await venuesRoute(
      new Request("http://localhost:3000/api/organizer/venues?regionId=jp&take=2")
    );
    const json = await res.json();
    expect(json.venues.length).toBeLessThanOrEqual(2);
    expect(json.take).toBe(2);
    for (const v of json.venues) expect(v.regionId).toBe("jp");
  });
});
