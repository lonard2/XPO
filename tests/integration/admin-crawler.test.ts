import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getCrawler, POST as postCrawler } from "@/app/api/crawler/route";
import { GET as getVenues, POST as postVenues } from "@/app/api/admin/venues/route";
import {
  GET as getVenueById,
  PUT as putVenueById,
  DELETE as deleteVenueById,
} from "@/app/api/admin/venues/[id]/route";
import { clearCrawlHistory } from "@/lib/crawler/venueScraper";
import { db } from "@/lib/db";

describe("Phase 11 & 12 Integration: Admin Governance, Venue CRUD & Crawler Engine", () => {
  beforeEach(() => {
    clearCrawlHistory();
  });

  // 1. Crawler Pipeline Integration
  it("I1.1: GET /api/crawler returns registered scrapers and history metadata", async () => {
    const req = new NextRequest("http://localhost:3000/api/crawler");
    const res = await getCrawler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.totalVenuesConfigured).toBeGreaterThanOrEqual(6);
    expect(Array.isArray(data.registeredScrapers)).toBe(true);
    expect(data.registeredScrapers.some((s: any) => s.slug === "jiexpo-kemayoran")).toBe(true);
    expect(data.registeredScrapers.some((s: any) => s.slug === "ice-bsd-city")).toBe(true);
  });

  it("I1.2: POST /api/crawler executes batch crawler and returns detailed run stats", async () => {
    const req = new NextRequest("http://localhost:3000/api/crawler", {
      method: "POST",
      body: JSON.stringify({
        venueSlugs: ["jiexpo-kemayoran", "ice-bsd-city"],
        dryRun: true,
        persistToDb: false,
      }),
    });

    const res = await postCrawler(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.runId).toMatch(/^CRAWL-/);
    expect(data.data.insertedCount).toBeGreaterThan(0);
    expect(data.data.status).toBe("COMPLETED");
  });

  // 2. Admin Venue CRUD Integration
  it("I2.1: GET /api/admin/venues retrieves list of venues with region filtering", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/venues?regionId=id");
    const res = await getVenues(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.venues)).toBe(true);
  });

  it("I2.2: POST, GET, PUT, and DELETE /api/admin/venues lifecycle", async () => {
    const testVenueName = `Integration Convention Arena ${Date.now()}`;
    const createReq = new NextRequest("http://localhost:3000/api/admin/venues", {
      method: "POST",
      body: JSON.stringify({
        name: testVenueName,
        regionId: "id",
        city: "Jakarta",
        address: "Jl. Pemuda No. 100, Rawamangun",
        latitude: -6.1955,
        longitude: 106.8821,
        transitInfo: "LRT Velodrome Station access; TransJakarta Corridor 4.",
        halls: [
          { name: "Arena Hall 1", capacity: 4000, floorAreaSqm: 6000, description: "Main sports and trade arena." },
          { name: "Conference Suite A", capacity: 500, floorAreaSqm: 1000, description: "Breakout conference hall." },
        ],
      }),
    });

    const createRes = await postVenues(createReq);
    const createData = await createRes.json();

    expect(createRes.status).toBe(201);
    expect(createData.success).toBe(true);
    expect(createData.venue).toBeDefined();
    expect(createData.venue.name).toBe(testVenueName);
    expect(createData.venue.halls.length).toBe(2);

    const createdId = createData.venue.id;

    // GET by ID
    const getReq = new NextRequest(`http://localhost:3000/api/admin/venues/${createdId}`);
    const getRes = await getVenueById(getReq, { params: Promise.resolve({ id: createdId }) });
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.success).toBe(true);
    expect(getData.venue.id).toBe(createdId);

    // PUT Update
    const putReq = new NextRequest(`http://localhost:3000/api/admin/venues/${createdId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: `${testVenueName} (Updated)`,
        city: "Jakarta Timur",
        address: "Jl. Pemuda No. 100, Rawamangun",
        halls: [
          { name: "Grand Velodrome Arena", capacity: 5000, floorAreaSqm: 7500 },
        ],
      }),
    });

    const putRes = await putVenueById(putReq, { params: Promise.resolve({ id: createdId }) });
    const putData = await putRes.json();

    expect(putRes.status).toBe(200);
    expect(putData.success).toBe(true);
    expect(putData.venue.name).toBe(`${testVenueName} (Updated)`);
    expect(putData.venue.halls.length).toBe(1);

    // DELETE
    const delReq = new NextRequest(`http://localhost:3000/api/admin/venues/${createdId}`, {
      method: "DELETE",
    });

    const delRes = await deleteVenueById(delReq, { params: Promise.resolve({ id: createdId }) });
    const delData = await delRes.json();

    expect(delRes.status).toBe(200);
    expect(delData.success).toBe(true);

    // Confirm deletion
    const verifyDelReq = new NextRequest(`http://localhost:3000/api/admin/venues/${createdId}`);
    const verifyDelRes = await getVenueById(verifyDelReq, { params: Promise.resolve({ id: createdId }) });
    expect(verifyDelRes.status).toBe(404);
  });
});
