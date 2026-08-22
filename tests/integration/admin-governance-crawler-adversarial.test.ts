import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  normalizeEventSlug,
  computeEventFingerprint,
  normalizeScrapedEvent,
  parseScrapedDateRange,
  deduplicateEvents,
  runVenueCrawlerBatch,
  getCrawlHistory,
  clearCrawlHistory,
  VENUE_SCRAPER_SOURCES,
  type ScrapedEventRaw,
  type NormalizedEvent,
} from "@/lib/crawler/venueScraper";
import {
  generateEventJsonLd,
  generatePlaceJsonLd,
  generateBreadcrumbJsonLd,
  generateMiceWebsiteJsonLd,
  getEventTypeFromArchetype,
  getAttendanceMode,
  type SeoEventInput,
  type SeoVenueInput,
} from "@/lib/seo/jsonLd";
import {
  hasPermission,
  canAccessRoute,
  getRoleHierarchy,
  getRolePermissionsMatrix,
  type UserRole,
  type Permission,
} from "@/lib/auth/rbac";
import { GET as getVenuesRoute, POST as postVenuesRoute } from "@/app/api/admin/venues/route";
import {
  GET as getVenueByIdRoute,
  PUT as putVenueByIdRoute,
  DELETE as deleteVenueByIdRoute,
} from "@/app/api/admin/venues/[id]/route";
import { GET as getCrawlerRoute, POST as postCrawlerRoute } from "@/app/api/crawler/route";
import manifest from "@/app/manifest";
import * as fs from "fs";
import * as path from "path";

describe("Milestone 8 Adversarial Suite: Admin Governance, Crawler, PWA & Schema Hardening", () => {
  beforeEach(() => {
    clearCrawlHistory();
  });

  // ==========================================================================
  // SECTION 1: CRAWLER FINGERPRINTING & DEDUPLICATION ADVERSARIAL TESTS
  // ==========================================================================
  describe("1. Crawler Fingerprinting & Normalization Adversarial Testing", () => {
    it("ADV-C1: SHA-256 fingerprint produces identical hash for equivalent inputs despite case & whitespace variance", () => {
      const date = new Date("2026-09-15T00:00:00.000Z");
      const fp1 = computeEventFingerprint("ice-bsd-city", "IndoBuildTech Expo 2026", date);
      const fp2 = computeEventFingerprint("  ICE-BSD-CITY  ", "  indobuildtech expo 2026  ", date);
      const fp3 = computeEventFingerprint("ice-bsd-city", "INDOBUILDTECH EXPO 2026", date);

      expect(fp1).toBe(fp2);
      expect(fp2).toBe(fp3);
      expect(fp1).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(fp1)).toBe(true);
    });

    it("ADV-C2: SHA-256 fingerprint changes when venue, title, or date differ (collision resistance)", () => {
      const date1 = new Date("2026-09-15T00:00:00.000Z");
      const date2 = new Date("2026-09-16T00:00:00.000Z");
      const title = "IndoBuildTech Expo 2026";
      const venue = "ice-bsd-city";

      const baseFp = computeEventFingerprint(venue, title, date1);
      const diffDateFp = computeEventFingerprint(venue, title, date2);
      const diffVenueFp = computeEventFingerprint("jiexpo-kemayoran", title, date1);
      const diffTitleFp = computeEventFingerprint(venue, "IndoBuildTech Expo 2027", date1);

      expect(baseFp).not.toBe(diffDateFp);
      expect(baseFp).not.toBe(diffVenueFp);
      expect(baseFp).not.toBe(diffTitleFp);
    });

    it("ADV-C3: handles exotic, unicode, accents, and adversarial title strings gracefully", () => {
      const titles = [
        "Salon International de l'Aéronautique et de l'Espace — Paris 2026",
        "東京国際ロボット展 2026 / Tokyo Robot Expo",
        "Pekan Raya Jakarta & Festival Musik: 100% Bersih!",
        "Special chars & quotes: '\"<script>alert(1)</script>' $100% -- #1",
        "Multiple    consecutive   spaces   and   hyphens---test",
      ];

      for (const t of titles) {
        const slug = normalizeEventSlug(t);
        expect(slug).toBeDefined();
        expect(slug.length).toBeGreaterThan(0);
        // Slugs must only contain lowercase alphanumeric and hyphens
        expect(/^[a-z0-9-]+$/.test(slug)).toBe(true);
        expect(slug.startsWith("-")).toBe(false);
        expect(slug.endsWith("-")).toBe(false);
      }
    });

    it("ADV-C4: date parser handles diverse date string patterns and fallbacks deterministically", () => {
      // 1. ISO Range
      const range1 = parseScrapedDateRange("2026-09-10 to 2026-09-15");
      expect(range1.startDate.getFullYear()).toBe(2026);
      expect(range1.startDate.getMonth()).toBe(8); // September is month 8 (0-indexed)
      expect(range1.startDate.getDate()).toBe(10);
      expect(range1.endDate.getDate()).toBe(15);

      // 2. Undefined/empty fallback
      const rangeFallback = parseScrapedDateRange(undefined);
      expect(rangeFallback.startDate).toBeInstanceOf(Date);
      expect(rangeFallback.endDate).toBeInstanceOf(Date);
      expect(rangeFallback.endDate.getTime()).toBeGreaterThan(rangeFallback.startDate.getTime());

      // 3. Deterministic hash fallback on arbitrary strings
      const rangeCustom1 = parseScrapedDateRange("Mid-Autumn Convention 2026");
      const rangeCustom2 = parseScrapedDateRange("Mid-Autumn Convention 2026");
      expect(rangeCustom1.startDate.getTime()).toBe(rangeCustom2.startDate.getTime());
      expect(rangeCustom1.endDate.getTime()).toBe(rangeCustom2.endDate.getTime());
    });

    it("ADV-C5: deduplication handles high-volume batches with duplicates correctly", () => {
      const rawBase: ScrapedEventRaw = {
        rawTitle: "High Volume Tech Expo",
        venueSlug: "tokyo-big-sight",
        dateString: "2026-10-01 to 2026-10-05",
        hallNames: ["East Hall 1"],
        category: "TECH_DEV_SUMMIT",
      };

      const normalizedList: NormalizedEvent[] = [];
      // Generate 100 events where every 5th event is a duplicate of the first
      for (let i = 0; i < 100; i++) {
        if (i % 5 === 0) {
          normalizedList.push(normalizeScrapedEvent(rawBase));
        } else {
          normalizedList.push(
            normalizeScrapedEvent({
              ...rawBase,
              rawTitle: `High Volume Tech Expo Session ${i}`,
            })
          );
        }
      }

      const existingSet = new Set<string>();
      const result = deduplicateEvents(existingSet, normalizedList);

      // Total items: 100.
      // There are 20 instances of rawBase (indices 0, 5, 10, ... 95). First instance is inserted, 19 are duplicates.
      // Remaining 80 unique sessions are inserted.
      // Expected toInsert = 1 + 80 = 81.
      // Expected toSkip = 19.
      expect(result.stats.total).toBe(100);
      expect(result.toInsert.length).toBe(81);
      expect(result.toSkip.length).toBe(19);
      expect(result.stats.newCount).toBe(81);
      expect(result.stats.duplicateCount).toBe(19);
    });

    it("ADV-C6: crawl history registry maintains bounded size (max 50) under rapid execution", async () => {
      for (let i = 0; i < 55; i++) {
        await runVenueCrawlerBatch({
          venueSlugs: ["ice-bsd-city"],
          dryRun: true,
          persistToDb: false,
        });
      }

      const history = getCrawlHistory();
      expect(history.length).toBeLessThanOrEqual(50);
      expect(history[0].status).toBe("COMPLETED");
    });

    it("ADV-C7: handles invalid venue slug in crawl batch options gracefully with recorded errors", async () => {
      const record = await runVenueCrawlerBatch({
        venueSlugs: ["non-existent-superdome-999"],
        dryRun: true,
        persistToDb: false,
      });

      expect(record.status).toBe("FAILED");
      expect(record.errors.length).toBeGreaterThan(0);
      expect(record.errors[0]).toContain("non-existent-superdome-999");
      expect(record.insertedCount).toBe(0);
    });
  });

  // ==========================================================================
  // SECTION 2: ADMIN VENUE DIRECTORY CRUD & CAPACITY ADVERSARIAL TESTS
  // ==========================================================================
  describe("2. Admin Venue Directory & Hall Validation Adversarial Testing", () => {
    it("ADV-V1: rejects venue creation when mandatory fields are missing or empty", async () => {
      const invalidPayloads = [
        {},
        { name: "" },
        { name: "Venue Without City", regionId: "id", address: "Jl. Test" },
        { name: "Venue Without Address", regionId: "id", city: "Jakarta" },
        { name: "Venue Without Region", city: "Tokyo", address: "Minato-ku" },
      ];

      for (const payload of invalidPayloads) {
        const req = new NextRequest("http://localhost:3000/api/admin/venues", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const res = await postVenuesRoute(req);
        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("Missing required fields");
      }
    });

    it("ADV-V2: generates unique slug when multiple venues share identical names", async () => {
      const venueName = `Colocated Convention Center ${Date.now()}`;
      const payload = {
        name: venueName,
        regionId: "id",
        city: "Jakarta",
        address: "Jl. Kemayoran No. 1",
      };

      const req1 = new NextRequest("http://localhost:3000/api/admin/venues", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res1 = await postVenuesRoute(req1);
      const data1 = await res1.json();

      expect(res1.status).toBe(201);
      const slug1 = data1.venue.slug;

      const req2 = new NextRequest("http://localhost:3000/api/admin/venues", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res2 = await postVenuesRoute(req2);
      const data2 = await res2.json();

      expect(res2.status).toBe(201);
      const slug2 = data2.venue.slug;

      expect(slug1).not.toBe(slug2);
      expect(slug2).toContain(slug1);

      // Cleanup
      await deleteVenueByIdRoute(new NextRequest("http://localhost:3000"), {
        params: Promise.resolve({ id: data1.venue.id }),
      });
      await deleteVenueByIdRoute(new NextRequest("http://localhost:3000"), {
        params: Promise.resolve({ id: data2.venue.id }),
      });
    });

    it("ADV-V3: returns 404 for non-existent venue lookup, update, or deletion", async () => {
      const nonExistentId = "non-existent-venue-id-999999";

      // GET
      const getRes = await getVenueByIdRoute(new NextRequest("http://localhost:3000"), {
        params: Promise.resolve({ id: nonExistentId }),
      });
      expect(getRes.status).toBe(404);
      const getData = await getRes.json();
      expect(getData.success).toBe(false);

      // PUT
      const putRes = await putVenueByIdRoute(
        new NextRequest("http://localhost:3000", {
          method: "PUT",
          body: JSON.stringify({ name: "Updated" }),
        }),
        { params: Promise.resolve({ id: nonExistentId }) }
      );
      expect(putRes.status).toBe(404);

      // DELETE
      const delRes = await deleteVenueByIdRoute(new NextRequest("http://localhost:3000", { method: "DELETE" }), {
        params: Promise.resolve({ id: nonExistentId }),
      });
      expect(delRes.status).toBe(404);
    });

    it("ADV-V4: accurately handles hall replacement and aggregation during PUT update", async () => {
      const venueName = `Hall Aggregation Test Venue ${Date.now()}`;
      const createRes = await postVenuesRoute(
        new NextRequest("http://localhost:3000/api/admin/venues", {
          method: "POST",
          body: JSON.stringify({
            name: venueName,
            regionId: "jp",
            city: "Tokyo",
            address: "Koto-ku, Tokyo Big Sight Area",
            latitude: 35.6298,
            longitude: 139.7942,
            halls: [
              { name: "Initial Hall 1", capacity: 1000, floorAreaSqm: 2000 },
              { name: "Initial Hall 2", capacity: 2000, floorAreaSqm: 3000 },
            ],
          }),
        })
      );
      const createData = await createRes.json();
      expect(createRes.status).toBe(201);
      const venueId = createData.venue.id;

      // Update with 3 new halls
      const updateRes = await putVenueByIdRoute(
        new NextRequest(`http://localhost:3000/api/admin/venues/${venueId}`, {
          method: "PUT",
          body: JSON.stringify({
            halls: [
              { name: "Grand Hall A", capacity: 5000, floorAreaSqm: 8000 },
              { name: "Grand Hall B", capacity: 4000, floorAreaSqm: 6000 },
              { name: "Executive Suite", capacity: 500, floorAreaSqm: 1000 },
            ],
          }),
        }),
        { params: Promise.resolve({ id: venueId }) }
      );
      const updateData = await updateRes.json();
      expect(updateRes.status).toBe(200);
      expect(updateData.venue.halls.length).toBe(3);

      const totalCap = updateData.venue.halls.reduce((a: number, h: any) => a + h.capacity, 0);
      const totalSqm = updateData.venue.halls.reduce((a: number, h: any) => a + h.floorAreaSqm, 0);
      expect(totalCap).toBe(9500);
      expect(totalSqm).toBe(15000);

      // Cleanup
      await deleteVenueByIdRoute(new NextRequest("http://localhost:3000"), {
        params: Promise.resolve({ id: venueId }),
      });
    });
  });

  // ==========================================================================
  // SECTION 3: RBAC & GOVERNANCE PERMISSIONS ADVERSARIAL TESTS
  // ==========================================================================
  describe("3. Admin Governance & RBAC Security Adversarial Testing", () => {
    it("ADV-G1: handles invalid/unknown/null roles safely without throwing exceptions", () => {
      expect(hasPermission("" as UserRole, "events:view")).toBe(false);
      expect(hasPermission("SUPERUSER" as UserRole, "events:view")).toBe(false);
      expect(canAccessRoute("" as UserRole, "/en/admin/dashboard")).toBe(false);
      expect(canAccessRoute("GUEST" as UserRole, "/en/admin/venues")).toBe(false);
      expect(getRoleHierarchy("INVALID_ROLE" as UserRole)).toBe(0);
    });

    it("ADV-G2: strictly enforces that only ADMIN can access any /admin/* subroutes", () => {
      const adminRoutes = [
        "/en/admin",
        "/en/admin/dashboard",
        "/en/admin/venues",
        "/en/admin/crawler",
        "/en/admin/audit",
        "/ja/admin/dashboard",
        "/id/admin/venues",
      ];

      for (const route of adminRoutes) {
        expect(canAccessRoute("ADMIN", route)).toBe(true);
        expect(canAccessRoute("ORGANIZER", route)).toBe(false);
        expect(canAccessRoute("ATTENDEE", route)).toBe(false);
      }
    });

    it("ADV-G3: verifies role permission matrix invariants across all 10 platform permissions", () => {
      const matrix = getRolePermissionsMatrix();
      expect(matrix.length).toBe(10);

      for (const entry of matrix) {
        // Admin must possess every single permission
        expect(entry.admin).toBe(true);
      }

      // Attendee can only view events and buy tickets
      const attendeeAllowed = matrix.filter((e) => e.attendee).map((e) => e.permission);
      expect(attendeeAllowed).toEqual(["events:view", "tickets:buy"]);

      // Organizer cannot run crawler, manage venues, or view audit logs
      const organizerForbidden = ["venues:manage", "crawler:run", "audit:view"];
      for (const p of organizerForbidden) {
        const item = matrix.find((e) => e.permission === p);
        expect(item?.organizer).toBe(false);
      }
    });
  });

  // ==========================================================================
  // SECTION 4: SCHEMA.ORG JSON-LD VALIDATOR ADVERSARIAL TESTS
  // ==========================================================================
  describe("4. Schema.org JSON-LD Structured Data Hardening", () => {
    it("ADV-S1: Event JSON-LD handles missing optional fields (no venue, no organizer, no hero image) cleanly", () => {
      const minimalEvent: SeoEventInput = {
        title: "Minimal Virtual Summit",
        slug: "minimal-virtual-summit",
        description: "Pure virtual event without physical venue or ticket tiers.",
        startDate: new Date("2026-10-01T09:00:00Z"),
        endDate: new Date("2026-10-01T17:00:00Z"),
        format: "VIRTUAL",
      };

      const jsonLd = generateEventJsonLd(minimalEvent) as any;

      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("Event");
      expect(jsonLd.name).toBe("Minimal Virtual Summit");
      expect(jsonLd.eventAttendanceMode).toBe("https://schema.org/OnlineEventAttendanceMode");
      expect(jsonLd.location).toBeDefined();
      expect(jsonLd.organizer).toBeDefined();
      expect(jsonLd.offers).toBeDefined();
      expect(jsonLd.image).toBeDefined();
      expect(Array.isArray(jsonLd.image)).toBe(true);
    });

    it("ADV-S2: Place JSON-LD correctly calculates total attendee capacity across arbitrary hall lists", () => {
      const venueWith5Halls: SeoVenueInput = {
        name: "Mega Convention Hub",
        slug: "mega-convention-hub",
        city: "Jakarta",
        address: "Jl. Mega No. 1",
        latitude: -6.2,
        longitude: 106.8,
        halls: [
          { name: "Hall 1", capacity: 1200 },
          { name: "Hall 2", capacity: 2300 },
          { name: "Hall 3", capacity: 3500 },
          { name: "Hall 4", capacity: null }, // Null capacity
          { name: "Hall 5", capacity: 500 },
        ],
      };

      const jsonLd = generatePlaceJsonLd(venueWith5Halls) as any;
      expect(jsonLd["@type"]).toBe("CivicStructure");
      expect(jsonLd.maximumAttendeeCapacity).toBe(7500);
      expect(jsonLd.containsPlace.length).toBe(5);
    });

    it("ADV-S3: BreadcrumbList JSON-LD creates correct 1-based sequential position indices", () => {
      const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "Japan Edition", url: "/region/jp" },
        { name: "Venues", url: "/venues" },
        { name: "Tokyo Big Sight", url: "/venues/tokyo-big-sight" },
      ];

      const jsonLd = generateBreadcrumbJsonLd(breadcrumbs) as any;
      expect(jsonLd["@type"]).toBe("BreadcrumbList");
      expect(jsonLd.itemListElement.length).toBe(4);

      for (let i = 0; i < jsonLd.itemListElement.length; i++) {
        expect(jsonLd.itemListElement[i].position).toBe(i + 1);
        expect(jsonLd.itemListElement[i]["@type"]).toBe("ListItem");
        expect(jsonLd.itemListElement[i].item.startsWith("http")).toBe(true);
      }
    });

    it("ADV-S4: WebSite JSON-LD contains valid Schema.org SearchAction specification", () => {
      const jsonLd = generateMiceWebsiteJsonLd("https://xpo.events") as any;
      expect(jsonLd["@type"]).toBe("WebSite");
      expect(jsonLd.potentialAction["@type"]).toBe("SearchAction");
      expect(jsonLd.potentialAction.target["@type"]).toBe("EntryPoint");
      expect(jsonLd.potentialAction.target.urlTemplate).toBe("https://xpo.events/events?q={search_term_string}");
    });
  });

  // ==========================================================================
  // SECTION 5: PWA & SERVICE WORKER SPECIFICATION ADVERSARIAL TESTS
  // ==========================================================================
  describe("5. PWA Manifest & Service Worker Strategy Verification", () => {
    it("ADV-P1: PWA manifest complies with W3C web manifest schema requirements", () => {
      const pwaManifest = manifest();

      expect(pwaManifest.name).toBe("XPO - MICE Digital Ecosystem");
      expect(pwaManifest.short_name).toBe("XPO");
      expect(pwaManifest.start_url).toBe("/");
      expect(pwaManifest.display).toBe("standalone");
      expect(pwaManifest.orientation).toBe("portrait-primary");
      expect(pwaManifest.theme_color).toBe("#2563eb");
      expect(pwaManifest.background_color).toBe("#0a0f1d");

      // Verify icons
      const icons = pwaManifest.icons || [];
      expect(icons.some((i) => i.sizes === "192x192" && i.purpose === "any")).toBe(true);
      expect(icons.some((i) => i.sizes === "512x512" && i.purpose === "any")).toBe(true);
      expect(icons.some((i) => i.sizes === "192x192" && i.purpose === "maskable")).toBe(true);
      expect(icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable")).toBe(true);

      // Verify shortcuts
      const shortcuts = pwaManifest.shortcuts || [];
      expect(shortcuts.length).toBeGreaterThanOrEqual(4);
      expect(shortcuts.some((s) => s.url === "/events")).toBe(true);
      expect(shortcuts.some((s) => s.url === "/my-tickets")).toBe(true);
      expect(shortcuts.some((s) => s.url === "/dashboard")).toBe(true);
      expect(shortcuts.some((s) => s.url === "/venues")).toBe(true);
    });

    it("ADV-P2: Service Worker (public/sw.js) contains versioning, caching strategies, and offline fallback", () => {
      const swPath = path.join(process.cwd(), "public", "sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, "utf-8");

      // Cache name & versioning
      expect(swContent).toContain("xpo-mice-cache-v1");

      // Lifecycle events
      expect(swContent).toContain('addEventListener("install"');
      expect(swContent).toContain('addEventListener("activate"');
      expect(swContent).toContain('addEventListener("fetch"');

      // Skip waiting & client claiming
      expect(swContent).toContain("self.skipWaiting()");
      expect(swContent).toContain("self.clients.claim()");

      // Routing strategies
      expect(swContent).toContain("caches.match");
      expect(swContent).toContain("OFFLINE_FALLBACK_HTML");
      expect(swContent).toContain("Offline Mode");
      expect(swContent).toContain("Retry Connection");
    });
  });
});
