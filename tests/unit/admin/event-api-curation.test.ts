import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runVenueCrawlerBatch, clearCrawlHistory } from "@/lib/crawler/venueScraper";
import { POST as createEventRoute } from "@/app/api/organizer/events/route";
import { db } from "@/lib/db";

describe("Event API and Ingestion Curation Decoupling", () => {
  describe("Crawl Ingestion Without Synthetic Users", () => {
    beforeEach(async () => {
      clearCrawlHistory();
      const jiexpoVenue = await db.venue.findUnique({ where: { slug: "jiexpo-kemayoran" } });
      if (jiexpoVenue) {
        const events = await db.event.findMany({
          where: { venueId: jiexpoVenue.id, isPlatformCurated: true },
          select: { id: true },
        });
        const ids = events.map((e) => e.id);
        if (ids.length > 0) {
          await db.ticketTier.deleteMany({ where: { eventId: { in: ids } } });
          await db.event.deleteMany({ where: { id: { in: ids } } });
        }
      }
    });

    afterEach(async () => {
      const jiexpoVenue = await db.venue.findUnique({ where: { slug: "jiexpo-kemayoran" } });
      if (jiexpoVenue) {
        const events = await db.event.findMany({
          where: { venueId: jiexpoVenue.id, isPlatformCurated: true },
          select: { id: true },
        });
        const ids = events.map((e) => e.id);
        if (ids.length > 0) {
          await db.ticketTier.deleteMany({ where: { eventId: { in: ids } } });
          await db.event.deleteMany({ where: { id: { in: ids } } });
        }
      }
    });

    it("ingests external schedules with organizerId: null and isPlatformCurated: true", async () => {
      const crawlerUsersBefore = await db.user.count({
        where: { email: { startsWith: "crawler-" } },
      });

      const batch = await runVenueCrawlerBatch({
        venueSlugs: ["jiexpo-kemayoran"],
        persistToDb: true,
        dryRun: false,
      });

      expect(batch.status).toMatch(/COMPLETED|PARTIAL/);
      expect(batch.insertedCount).toBeGreaterThanOrEqual(1);

      // Verify in database that inserted events have null organizerId and isPlatformCurated: true
      const curatedEvents = await db.event.findMany({
        where: { isPlatformCurated: true },
      });
      expect(curatedEvents.length).toBeGreaterThan(0);

      for (const evt of curatedEvents) {
        expect(evt.organizerId).toBeNull();
        expect(evt.organizerName).toBeTruthy();
        expect(evt.isPlatformCurated).toBe(true);
      }

      // Verify no synthetic crawler user accounts were created
      const crawlerUsersAfter = await db.user.count({
        where: { email: { startsWith: "crawler-" } },
      });
      expect(crawlerUsersAfter).toBe(crawlerUsersBefore);
    });
  });

  describe("POST /api/organizer/events Decoupled Curation", () => {
    it("creates platform curated event when userRole is ADMIN and isPlatformCurated is true", async () => {
      const venue = await db.venue.findFirst();
      expect(venue).toBeDefined();

      const testSlug = `admin-curated-${Date.now()}`;
      const req = new Request("http://localhost:3000/api/organizer/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-xpo-user-role": "ADMIN",
        },
        body: JSON.stringify({
          title: "Admin Curated Global Expo",
          slug: testSlug,
          description: "Curated by administration council without organizer account.",
          venueId: venue!.id,
          startDate: "2027-09-01T09:00:00.000Z",
          endDate: "2027-09-04T18:00:00.000Z",
          isPlatformCurated: true,
          organizerName: "Jakarta Trade & Convention Bureau",
        }),
      });

      const res = await createEventRoute(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.event).toBeDefined();
      expect(json.event.organizerId).toBeNull();
      expect(json.event.isPlatformCurated).toBe(true);
      expect(json.event.organizerName).toBe("Jakarta Trade & Convention Bureau");

      // Clean up
      await db.ticketTier.deleteMany({ where: { eventId: json.event.id } });
      await db.event.delete({ where: { id: json.event.id } });
    });

    it("defaults to XPO Platform Administration when ADMIN does not provide organizerName or organizerId", async () => {
      const venue = await db.venue.findFirst();
      expect(venue).toBeDefined();

      const testSlug = `admin-default-${Date.now()}`;
      const req = new Request("http://localhost:3000/api/organizer/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-xpo-user-role": "ADMIN",
        },
        body: JSON.stringify({
          title: "Admin Default Curation Event",
          slug: testSlug,
          description: "Curated event with default platform attribution.",
          venueId: venue!.id,
          startDate: "2027-10-01T09:00:00.000Z",
          endDate: "2027-10-03T18:00:00.000Z",
        }),
      });

      const res = await createEventRoute(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.event.organizerId).toBeNull();
      expect(json.event.isPlatformCurated).toBe(true);
      expect(json.event.organizerName).toBe("XPO Platform Administration");

      // Clean up
      await db.ticketTier.deleteMany({ where: { eventId: json.event.id } });
      await db.event.delete({ where: { id: json.event.id } });
    });

    it("binds to authenticated organizer account when userRole is ORGANIZER", async () => {
      const venue = await db.venue.findFirst();
      expect(venue).toBeDefined();

      const organizer = await db.user.findFirst({
        where: { role: "ORGANIZER" },
      });
      expect(organizer).toBeDefined();

      const testSlug = `organizer-bound-${Date.now()}`;
      const req = new Request("http://localhost:3000/api/organizer/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-xpo-user-role": "ORGANIZER",
          "x-xpo-user-id": organizer!.id,
        },
        body: JSON.stringify({
          title: "Organizer Managed Summit",
          slug: testSlug,
          description: "Summit hosted by authenticated organizer tenant.",
          venueId: venue!.id,
          startDate: "2027-11-01T09:00:00.000Z",
          endDate: "2027-11-03T18:00:00.000Z",
        }),
      });

      const res = await createEventRoute(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.event.organizerId).toBe(organizer!.id);
      expect(json.event.isPlatformCurated).toBe(false);
      expect(json.event.organizerName).toBe(organizer!.organization || organizer!.name);

      // Clean up
      await db.ticketTier.deleteMany({ where: { eventId: json.event.id } });
      await db.event.delete({ where: { id: json.event.id } });
    });
  });
});
