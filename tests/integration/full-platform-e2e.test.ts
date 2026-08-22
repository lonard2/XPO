import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import * as fs from "fs";
import * as path from "path";

// Contracts & Utilities
import {
  generateTicketHash,
  verifyTicketHash,
  generateSvgQrCode,
  type TicketPassPayload,
} from "@/lib/tickets/qrPass";
import {
  formatCurrency,
  formatDateRange,
  getLocaleDirection,
} from "@/lib/i18n/formatters";
import {
  ARCHETYPE_DEFAULTS,
  ARCHETYPE_LIST,
  ARCHETYPE_METAS,
  getArchetypeTokens,
  getArchetypeCssVariables,
  type MiceArchetype,
} from "@/lib/theming";
import {
  OPENROUTER_MODEL_SPECS,
  generateGroundedStructuredData,
  generateStructuredReport,
  streamOpenRouterChat,
  type OpenRouterModel,
} from "@/lib/ai/openrouter";
import {
  DailyExecutiveDigestSchema,
  SentimentFeedbackSchema,
  FootTrafficOptimizationSchema,
} from "@/lib/ai/schemas";
import {
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessRoute,
  getRoleHierarchy,
  type UserRole,
  type Permission,
} from "@/lib/auth/rbac";
import {
  normalizeEventSlug,
  computeEventFingerprint,
  deduplicateEvents,
  normalizeScrapedEvent,
  runVenueCrawlerBatch,
  type ScrapedEventRaw,
} from "@/lib/crawler/venueScraper";
import {
  generateEventJsonLd,
  generatePlaceJsonLd,
  generateBreadcrumbJsonLd,
  generateMiceWebsiteJsonLd,
} from "@/lib/seo/jsonLd";
import manifest from "@/app/manifest";

// API Route Handlers
import { POST as postCheckout } from "@/app/api/tickets/checkout/route";
import { POST as postVerify, GET as getVerify } from "@/app/api/tickets/verify/route";
import { POST as postOrganizerEvent, GET as getOrganizerEvents } from "@/app/api/organizer/events/route";
import { PUT as putBranding } from "@/app/api/organizer/events/[id]/branding/route";
import { POST as postBooths, GET as getBooths } from "@/app/api/organizer/booths/route";
import { POST as postAiReports, GET as getAiReports } from "@/app/api/ai/reports/route";
import { POST as postAiConcierge } from "@/app/api/ai/concierge/route";
import { GET as getVenues, POST as postVenues } from "@/app/api/admin/venues/route";
import { GET as getVenueById, DELETE as deleteVenueById } from "@/app/api/admin/venues/[id]/route";
import { GET as getCrawler, POST as postCrawler } from "@/app/api/crawler/route";

describe("XPO Full-Platform End-to-End Integration Suite (Milestone 9 Hardening)", () => {
  const createdTestEventIds: string[] = [];
  const createdTestVenueIds: string[] = [];
  const createdTestBookingIds: string[] = [];

  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    // 1. Clean up created bookings
    if (createdTestBookingIds.length > 0) {
      await db.booking.deleteMany({
        where: { id: { in: createdTestBookingIds } },
      });
    }
    await db.booking.deleteMany({
      where: { attendeeEmail: { contains: "e2e-full-suite" } },
    });

    // 2. Clean up created AI reports
    if (createdTestEventIds.length > 0) {
      await db.aIReport.deleteMany({
        where: { eventId: { in: createdTestEventIds } },
      });
      await db.ticketTier.deleteMany({
        where: { eventId: { in: createdTestEventIds } },
      });
      await db.boothTenant.deleteMany({
        where: { eventId: { in: createdTestEventIds } },
      });
      await db.event.deleteMany({
        where: { id: { in: createdTestEventIds } },
      });
    }

    // 3. Clean up created test venues
    if (createdTestVenueIds.length > 0) {
      await db.venueHall.deleteMany({
        where: { venueId: { in: createdTestVenueIds } },
      });
      await db.venue.deleteMany({
        where: { id: { in: createdTestVenueIds } },
      });
    }

    await db.$disconnect();
  });

  // ==========================================================================
  // JOURNEY 1: Attendee Discovery & Regional Country Editions
  // ==========================================================================
  describe("Journey 1: Attendee Discovery & Regional Portals (/id, /jp, /global)", () => {
    it("E2E 1.1: Resolves country editions with regional venues, currencies and localized formats", async () => {
      // 1. Indonesia Edition (/id)
      const idVenues = await db.venue.findMany({
        where: { regionId: "id" },
        include: { halls: true, events: true },
      });
      expect(idVenues.length).toBeGreaterThanOrEqual(3);
      const jiexpo = idVenues.find((v) => v.slug.includes("jiexpo"));
      expect(jiexpo).toBeDefined();
      expect(jiexpo?.city).toContain("Jakarta");
      expect(jiexpo?.halls.length).toBeGreaterThanOrEqual(2);

      // Verify IDR currency formatting
      const idrFormatted = formatCurrency(250000, "IDR", "id");
      expect(idrFormatted).toContain("Rp");

      // 2. Japan Edition (/jp)
      const jpVenues = await db.venue.findMany({
        where: { regionId: "jp" },
        include: { halls: true, events: true },
      });
      expect(jpVenues.length).toBeGreaterThanOrEqual(2);
      const tokyoBigSight = jpVenues.find((v) => v.slug.includes("tokyo-big-sight"));
      expect(tokyoBigSight).toBeDefined();
      expect(tokyoBigSight?.city).toContain("Tokyo");

      // Verify JPY currency formatting
      const jpyFormatted = formatCurrency(15000, "JPY", "ja");
      expect(jpyFormatted).toContain("￥");

      // 3. Global Hubs (/global)
      const globalVenues = await db.venue.findMany({
        where: { regionId: "global" },
        include: { halls: true, events: true },
      });
      expect(globalVenues.length).toBeGreaterThanOrEqual(2);

      // Verify USD currency formatting
      const usdFormatted = formatCurrency(499, "USD", "en");
      expect(usdFormatted).toContain("$");
    });

    it("E2E 1.2: Executes faceted search filtering across categories, formats, and keyword search", async () => {
      // Fetch manufacturing expo
      const searchResults = await db.event.findMany({
        where: {
          OR: [
            { title: { contains: "Manufacturing" } },
            { description: { contains: "Industrial" } },
            { archetype: "INDUSTRIAL_B2B" },
          ],
        },
        include: { venue: true, venueHall: true, ticketTiers: true },
      });

      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      const mfgEvent = searchResults[0];
      expect(mfgEvent.archetype).toBe("INDUSTRIAL_B2B");
      expect(mfgEvent.venue).toBeDefined();
      expect(mfgEvent.ticketTiers.length).toBeGreaterThan(0);

      // Date range formatting test
      const formattedDates = formatDateRange(mfgEvent.startDate, mfgEvent.endDate, "en");
      expect(formattedDates).toContain("2026");
    });
  });

  // ==========================================================================
  // JOURNEY 2: Ticket Checkout & Cryptographic HMAC-SHA256 Pass Signing
  // ==========================================================================
  describe("Journey 2: Ticket Checkout, Cryptographic HMAC-SHA256 Pass Signing & Digital Guidebook", () => {
    let bookedTicketId = "";
    let generatedSignature = "";
    let generatedPayloadString = "";
    let generatedQrHash = "";

    it("E2E 2.1: Executes POST /api/tickets/checkout with capacity check and HMAC pass creation", async () => {
      const event = await db.event.findFirst({
        where: { slug: "manufacturing-indonesia-2026" },
        include: { ticketTiers: true, venue: true, venueHall: true },
      });
      expect(event).toBeDefined();
      const tier = event!.ticketTiers[0];
      expect(tier).toBeDefined();
      const initialSoldCount = tier.soldCount;

      const checkoutReq = new NextRequest("http://localhost:3000/api/tickets/checkout", {
        method: "POST",
        body: JSON.stringify({
          eventId: event!.id,
          tierId: tier.id,
          attendeeName: "E2E Lead Auditor",
          attendeeEmail: "e2e-full-suite-auditor@xpo.com",
          quantity: 1,
        }),
      });

      const res = await postCheckout(checkoutReq);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.booking).toBeDefined();
      expect(data.booking.id).toMatch(/^bk-/);
      expect(data.booking.qrCodeHash).toContain("XPO-PASS-");
      expect(data.booking.signature).toBeDefined();
      expect(data.booking.svgQr).toContain("<svg");

      bookedTicketId = data.booking.id;
      generatedSignature = data.booking.signature;
      generatedPayloadString = data.booking.payloadString;
      generatedQrHash = data.booking.qrCodeHash;
      createdTestBookingIds.push(bookedTicketId);

      // Verify sold count increment in DB
      const updatedTier = await db.ticketTier.findUnique({ where: { id: tier.id } });
      expect(updatedTier?.soldCount).toBe(initialSoldCount + 1);
    });

    it("E2E 2.2: Cryptographically verifies HMAC-SHA256 signature and rejects tampering", () => {
      // 1. Verify valid payload and signature
      const validCheck = verifyTicketHash(generatedPayloadString, generatedSignature);
      expect(validCheck.valid).toBe(true);
      expect(validCheck.payload?.bookingId).toBe(bookedTicketId);

      // 2. Reject tampered payload string (e.g. altered email)
      const tamperedPayload = generatedPayloadString.replace("e2e-full-suite-auditor@xpo.com", "attacker@evil.com");
      const tamperedCheck = verifyTicketHash(tamperedPayload, generatedSignature);
      expect(tamperedCheck.valid).toBe(false);
      expect(tamperedCheck.error).toContain("INVALID_SIGNATURE");

      // 3. Reject corrupted signature
      const corruptedSignature = generatedSignature.slice(0, -4) + "ffff";
      const corruptedCheck = verifyTicketHash(generatedPayloadString, corruptedSignature);
      expect(corruptedCheck.valid).toBe(false);
    });

    it("E2E 2.3: Generates vector SVG QR code with zero emojis and embedded checksum", () => {
      const svgOutput = generateSvgQrCode(generatedQrHash, { primaryColor: "#2563eb", size: 300 });
      expect(svgOutput).toContain("<svg");
      expect(svgOutput).toContain('data-qr-encoded="');
      expect(svgOutput).toContain('data-checksum="');
      expect(svgOutput).toContain('viewBox="0 0 300 300"');
      // Assert zero emoji characters
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(svgOutput)).toBe(false);
    });

    it("E2E 2.4: Resolves digital guidebook schedule and floor map data for attendee", async () => {
      const booking = await db.booking.findUnique({
        where: { id: bookedTicketId },
        include: {
          event: {
            include: {
              venue: { include: { halls: true } },
              venueHall: true,
              agendaItems: { orderBy: { startTime: "asc" } },
              booths: true,
              perks: true,
            },
          },
          ticketTier: true,
        },
      });

      expect(booking).toBeDefined();
      expect(booking?.event.venue).toBeDefined();
      expect(booking?.event.venue.halls.length).toBeGreaterThanOrEqual(1);
      expect(booking?.event.agendaItems.length).toBeGreaterThanOrEqual(1);
      expect(booking?.event.booths.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // JOURNEY 3: UI/UX Settings Suite & Theme Engine
  // ==========================================================================
  describe("Journey 3: UI/UX Settings Suite, Theming & Motion Preferences", () => {
    it("E2E 3.1: Validates all 15 MICE archetype theme definitions and CSS token injection", () => {
      expect(ARCHETYPE_LIST.length).toBe(15);

      for (const archetype of ARCHETYPE_LIST) {
        const tokens = getArchetypeTokens(archetype);
        expect(tokens.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(tokens.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(tokens.displayName).toBeDefined();

        const meta = ARCHETYPE_METAS[archetype];
        expect(meta).toBeDefined();
        expect(meta.label).toBeDefined();
        expect(meta.accentIcon).toBeDefined();

        const cssVars = getArchetypeCssVariables(archetype, {
          primaryColor: "#ff0055",
          accentColor: "#00ffcc",
        });
        expect(cssVars["--archetype-primary"]).toBe("#ff0055");
        expect(cssVars["--archetype-accent"]).toBe("#00ffcc");
      }
    });

    it("E2E 3.2: Validates Typography and Direction contracts for multilingual locales", () => {
      expect(getLocaleDirection("en")).toBe("ltr");
      expect(getLocaleDirection("ja")).toBe("ltr");
      expect(getLocaleDirection("id")).toBe("ltr");
      expect(getLocaleDirection("ar")).toBe("rtl");
    });
  });

  // ==========================================================================
  // JOURNEY 4: Multi-Role RBAC Authentication & Route Protection
  // ==========================================================================
  describe("Journey 4: Multi-Role RBAC Authentication & Route Security", () => {
    it("E2E 4.1: Enforces strict permission hierarchy across ATTENDEE, ORGANIZER, and ADMIN roles", () => {
      // Attendee permissions
      expect(hasPermission("ATTENDEE", "events:view")).toBe(true);
      expect(hasPermission("ATTENDEE", "tickets:buy")).toBe(true);
      expect(hasPermission("ATTENDEE", "events:create")).toBe(false);
      expect(hasPermission("ATTENDEE", "venues:manage")).toBe(false);
      expect(hasPermission("ATTENDEE", "crawler:run")).toBe(false);

      // Organizer permissions
      expect(hasPermission("ORGANIZER", "events:view")).toBe(true);
      expect(hasPermission("ORGANIZER", "events:create")).toBe(true);
      expect(hasPermission("ORGANIZER", "booths:manage")).toBe(true);
      expect(hasPermission("ORGANIZER", "ai:reports")).toBe(true);
      expect(hasPermission("ORGANIZER", "venues:manage")).toBe(false);
      expect(hasPermission("ORGANIZER", "crawler:run")).toBe(false);

      // Admin permissions
      expect(hasPermission("ADMIN", "events:view")).toBe(true);
      expect(hasPermission("ADMIN", "events:create")).toBe(true);
      expect(hasPermission("ADMIN", "venues:manage")).toBe(true);
      expect(hasPermission("ADMIN", "crawler:run")).toBe(true);
      expect(hasPermission("ADMIN", "audit:view")).toBe(true);

      // Role hierarchy integer check
      expect(getRoleHierarchy("ADMIN")).toBeGreaterThan(getRoleHierarchy("ORGANIZER"));
      expect(getRoleHierarchy("ORGANIZER")).toBeGreaterThan(getRoleHierarchy("ATTENDEE"));
    });

    it("E2E 4.2: Guard routes correctly for all roles", () => {
      // Public attendee routes
      expect(canAccessRoute("ATTENDEE", "/en/events")).toBe(true);
      expect(canAccessRoute("ATTENDEE", "/en/venues")).toBe(true);
      expect(canAccessRoute("ATTENDEE", "/en/settings")).toBe(true);

      // Organizer protected routes
      expect(canAccessRoute("ATTENDEE", "/en/dashboard")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/en/events/new")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/en/booths")).toBe(false);
      expect(canAccessRoute("ORGANIZER", "/en/dashboard")).toBe(true);
      expect(canAccessRoute("ORGANIZER", "/en/events/new")).toBe(true);
      expect(canAccessRoute("ADMIN", "/en/dashboard")).toBe(true);

      // Admin protected routes
      expect(canAccessRoute("ATTENDEE", "/en/admin/dashboard")).toBe(false);
      expect(canAccessRoute("ORGANIZER", "/en/admin/venues")).toBe(false);
      expect(canAccessRoute("ORGANIZER", "/en/admin/crawler")).toBe(false);
      expect(canAccessRoute("ADMIN", "/en/admin/dashboard")).toBe(true);
      expect(canAccessRoute("ADMIN", "/en/admin/venues")).toBe(true);
      expect(canAccessRoute("ADMIN", "/en/admin/crawler")).toBe(true);
    });
  });

  // ==========================================================================
  // JOURNEY 5: Organizer Command Center (Wizard, Customizer, Scanner)
  // ==========================================================================
  describe("Journey 5: Organizer Command Center (Event Creation, Branding & Door Staff QR Scanner)", () => {
    let createdEventId = "";

    it("E2E 5.1: Creates new MICE event with multi-tier passes via POST /api/organizer/events", async () => {
      const venue = await db.venue.findFirst({ where: { regionId: "id" } });
      expect(venue).toBeDefined();

      const createReq = new NextRequest("http://localhost:3000/api/organizer/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Asia-Pacific Clean Energy Forum 2026",
          tagline: "Accelerating Renewable Grids & Green Infrastructure",
          description: "High-level clean energy transition symposium uniting policymakers and engineers.",
          archetype: "ENERGY_INFRASTRUCTURE",
          format: "IN_PERSON",
          scale: "LARGE",
          regionId: "id",
          venueId: venue!.id,
          startDate: new Date("2026-10-15T09:00:00Z").toISOString(),
          endDate: new Date("2026-10-18T18:00:00Z").toISOString(),
          primaryColor: "#ca8a04",
          accentColor: "#16a34a",
          ticketTiers: [
            {
              name: "Clean Energy Delegate Pass",
              price: 1500000,
              currency: "IDR",
              capacity: 800,
              benefits: ["Keynote Access", "Grid Tech Pavilion"],
            },
            {
              name: "VIP Ministerial Access",
              price: 5000000,
              currency: "IDR",
              capacity: 100,
              benefits: ["Bilateral Meeting Lounge", "Gala Dinner"],
            },
          ],
        }),
      });

      const res = await postOrganizerEvent(createReq);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.event).toBeDefined();
      expect(data.event.id).toBeDefined();
      expect(data.event.ticketTiers.length).toBe(2);

      createdEventId = data.event.id;
      createdTestEventIds.push(createdEventId);
    });

    it("E2E 5.2: Updates live visual branding and CSS variables via PUT /api/organizer/events/[id]/branding", async () => {
      const brandingReq = new NextRequest(`http://localhost:3000/api/organizer/events/${createdEventId}/branding`, {
        method: "PUT",
        body: JSON.stringify({
          title: "Asia-Pacific Clean Energy Forum 2026 (Branded)",
          heroImageUrl: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1600&q=80",
          brandingConfig: {
            primaryColor: "#0284c7",
            accentColor: "#f59e0b",
          },
        }),
      });

      const res = await putBranding(brandingReq, { params: Promise.resolve({ id: createdEventId }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.event.title).toBe("Asia-Pacific Clean Energy Forum 2026 (Branded)");

      // Check CSS variable injection from updated config
      const parsedConfig = JSON.parse(data.event.brandingConfigJson);
      expect(parsedConfig.primaryColor).toBe("#0284c7");
      const cssVars = getArchetypeCssVariables("ENERGY_INFRASTRUCTURE", parsedConfig);
      expect(cssVars["--archetype-primary"]).toBe("#0284c7");
      expect(cssVars["--archetype-accent"]).toBe("#f59e0b");
    });

    it("E2E 5.3: Allocates exhibition booths via POST /api/organizer/booths", async () => {
      const boothReq = new NextRequest("http://localhost:3000/api/organizer/booths", {
        method: "POST",
        body: JSON.stringify({
          eventId: createdEventId,
          companyName: "Siemens Energy Global",
          boothNumber: "E-101",
          hallName: "Exhibition Hall E",
          industry: "Smart Grid Inverters",
          websiteUrl: "https://siemens-energy.com",
          description: "High-voltage grid transmission and renewable storage solutions.",
        }),
      });

      const res = await postBooths(boothReq);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.booth).toBeDefined();
      expect(data.booth.companyName).toBe("Siemens Energy Global");
      expect(data.booth.boothNumber).toBe("E-101");
    });

    it("E2E 5.4: Executes Door Staff QR check-in with double-scan detection and security verification", async () => {
      // 1. Create a fresh pass for door test
      const event = await db.event.findUnique({
        where: { id: createdEventId },
        include: { ticketTiers: true },
      });
      const tier = event!.ticketTiers[0];

      const checkoutReq = new NextRequest("http://localhost:3000/api/tickets/checkout", {
        method: "POST",
        body: JSON.stringify({
          eventId: createdEventId,
          tierId: tier.id,
          attendeeName: "Door Check Delegate",
          attendeeEmail: "e2e-full-suite-door@xpo.com",
        }),
      });
      const checkoutRes = await postCheckout(checkoutReq);
      const checkoutData = await checkoutRes.json();
      const passQr = checkoutData.booking.qrCodeHash;
      createdTestBookingIds.push(checkoutData.booking.id);

      // 2. First Scan -> Door Entry Granted
      const scan1Req = new NextRequest("http://localhost:3000/api/tickets/verify", {
        method: "POST",
        body: JSON.stringify({ qrCodeHash: passQr, autoCheckIn: true }),
      });
      const scan1Res = await postVerify(scan1Req);
      const scan1Data = await scan1Res.json();

      expect(scan1Res.status).toBe(200);
      expect(scan1Data.valid).toBe(true);
      expect(scan1Data.alreadyCheckedIn).toBe(false);
      expect(scan1Data.status).toBe("CHECKED_IN");
      expect(scan1Data.message).toContain("DOOR_ENTRY_GRANTED");

      // 3. Second Scan -> Double Scan Detected
      const scan2Req = new NextRequest("http://localhost:3000/api/tickets/verify", {
        method: "POST",
        body: JSON.stringify({ qrCodeHash: passQr, autoCheckIn: true }),
      });
      const scan2Res = await postVerify(scan2Req);
      const scan2Data = await scan2Res.json();

      expect(scan2Res.status).toBe(200);
      expect(scan2Data.valid).toBe(true);
      expect(scan2Data.alreadyCheckedIn).toBe(true);
      expect(scan2Data.message).toContain("DOUBLE_SCAN");

      // 4. Invalid Pass -> 404
      const invalidScanReq = new NextRequest("http://localhost:3000/api/tickets/verify", {
        method: "POST",
        body: JSON.stringify({ qrCodeHash: "XPO-PASS-NONEXISTENT-HASH", autoCheckIn: true }),
      });
      const invalidRes = await postVerify(invalidScanReq);
      expect(invalidRes.status).toBe(404);
    });
  });

  // ==========================================================================
  // JOURNEY 6: OpenRouter Multi-Model AI Reporting Suite
  // ==========================================================================
  describe("Journey 6: OpenRouter Multi-Model AI Gateway & Structured Analytics", () => {
    it("E2E 6.1: Validates specs for all 6 supported OpenRouter models", () => {
      const expectedModels: OpenRouterModel[] = [
        "google/gemini-3.5-flash-lite",
        "google/gemini-3.7-flash",
        "deepseek/deepseek-v4-pro-0813",
        "qwen/qwen3.7-plus",
        "openai/gpt-5.6-luna",
        "google/gemma-4-26b-a4b-it",
      ];

      for (const model of expectedModels) {
        const spec = OPENROUTER_MODEL_SPECS[model];
        expect(spec).toBeDefined();
        expect(spec.displayName).toBeDefined();
        expect(spec.contextWindow).toBeGreaterThan(0);
        expect(spec.primaryCapability).toBeDefined();
      }
    });

    it("E2E 6.2: Validates all 3 structured Zod schemas (Daily Digest, Sentiment, Foot-Traffic)", async () => {
      const mockEventMetrics = {
        id: "evt-clean-energy",
        title: "Asia-Pacific Clean Energy Forum 2026",
        slug: "asia-pacific-clean-energy-forum-2026",
        description: "High-level clean energy transition symposium.",
        archetype: "ENERGY_INFRASTRUCTURE",
        format: "IN_PERSON",
        scale: "LARGE",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        venue: {
          id: "v-jiexpo",
          name: "JIExpo Kemayoran",
          city: "Jakarta",
          transitInfo: "TransJakarta Corridor 12",
        },
        totalBookings: 1200,
        totalCheckedIn: 940,
        checkInRatePercent: 78,
        grossRevenue: 450000000,
        currency: "IDR",
        ticketTiers: [
          { id: "t1", name: "Clean Energy Delegate", price: 1500000, currency: "IDR", capacity: 800, soldCount: 600 },
        ],
        booths: [
          { id: "b1", companyName: "Siemens Energy", boothNumber: "E-101", hallName: "Hall E" },
        ],
        agendaItems: [
          { id: "a1", title: "Smart Grid Keynote", speakerName: "Grid Experts", location: "Plenary Hall", startTime: "10:00", endTime: "11:30" },
        ],
      };

      // 1. Daily Executive Digest
      const digestData = generateGroundedStructuredData(
        mockEventMetrics,
        "google/gemini-3.7-flash",
        "DAILY_DIGEST",
        "Clean Grid Focus"
      );
      const validatedDigest = DailyExecutiveDigestSchema.parse(digestData);
      expect(validatedDigest.summary).toBeDefined();
      expect(typeof validatedDigest.sentimentScore).toBe("number");
      expect(typeof validatedDigest.footTrafficIndex).toBe("number");
      expect(validatedDigest.topSessions.length).toBeGreaterThan(0);
      expect(validatedDigest.recommendedActions.length).toBeGreaterThan(0);

      // 2. Sentiment & Feedback Analysis
      const sentimentData = generateGroundedStructuredData(
        mockEventMetrics,
        "deepseek/deepseek-v4-pro-0813",
        "SENTIMENT"
      );
      const validatedSentiment = SentimentFeedbackSchema.parse(sentimentData);
      expect(validatedSentiment.attendeeSatisfactionIndex).toBeGreaterThanOrEqual(0);
      expect(validatedSentiment.positiveThemes.length).toBeGreaterThan(0);
      expect(validatedSentiment.criticalConcerns.length).toBeGreaterThan(0);

      // 3. Foot-Traffic & Booth Optimization
      const footTrafficData = generateGroundedStructuredData(
        mockEventMetrics,
        "qwen/qwen3.7-plus",
        "FOOT_TRAFFIC"
      );
      const validatedTraffic = FootTrafficOptimizationSchema.parse(footTrafficData);
      expect(validatedTraffic.peakCongestionHours.length).toBeGreaterThan(0);
      expect(validatedTraffic.hallUtilization.length).toBeGreaterThan(0);
      expect(validatedTraffic.bottleneckLocations.length).toBeGreaterThan(0);
    });

    it("E2E 6.3: Consumes ReadableStream token streaming from OpenRouter chat gateway", async () => {
      const stream = await streamOpenRouterChat({
        model: "google/gemini-3.5-flash-lite",
        messages: [{ role: "user", content: "Where is Hall A located?" }],
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      expect(fullText.length).toBeGreaterThan(0);
      expect(typeof fullText).toBe("string");
    });

    it("E2E 6.4: Executes POST /api/ai/reports generating persistent report record in database", async () => {
      const event = await db.event.findFirst();
      expect(event).toBeDefined();

      const reportReq = new NextRequest("http://localhost:3000/api/ai/reports", {
        method: "POST",
        body: JSON.stringify({
          eventId: event!.id,
          reportType: "DAILY_DIGEST",
          model: "google/gemini-3.5-flash-lite",
        }),
      });

      const res = await postAiReports(reportReq);
      expect(res.status).toBe(200);
      expect(res.headers.get("x-report-type")).toBe("DAILY_DIGEST");
      expect(res.headers.get("x-report-model")).toBe("google/gemini-3.5-flash-lite");

      // Verify report was persisted in DB
      const dbReport = await db.aIReport.findFirst({
        where: { eventId: event!.id },
        orderBy: { createdAt: "desc" },
      });
      expect(dbReport).toBeDefined();
      expect(dbReport?.reportType).toBe("DAILY_DIGEST");
    });
  });

  // ==========================================================================
  // JOURNEY 7: Admin Governance, Venue Directory & Event Crawler Pipeline
  // ==========================================================================
  describe("Journey 7: Admin Governance, Venue Directory Manager & Automated Crawler Pipeline", () => {
    let createdVenueId = "";

    it("E2E 7.1: Creates new convention venue with exact GPS coordinates and nested halls via POST /api/admin/venues", async () => {
      const venueReq = new NextRequest("http://localhost:3000/api/admin/venues", {
        method: "POST",
        body: JSON.stringify({
          name: "Tokyo International Waterfront Arena",
          regionId: "jp",
          city: "Tokyo",
          address: "3-11-1 Ariake, Koto City, Tokyo",
          latitude: 35.6329,
          longitude: 139.7942,
          transitInfo: "Direct connection via Yurikamome Line Ariake-Mukai Station.",
          halls: [
            { name: "Ocean Exhibition Hall 1", capacity: 8000, floorAreaSqm: 12000 },
            { name: "Grand Plenary Auditorium", capacity: 2500, floorAreaSqm: 3500 },
          ],
        }),
      });

      const res = await postVenues(venueReq);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.venue).toBeDefined();
      expect(data.venue.halls.length).toBe(2);
      expect(data.venue.latitude).toBeCloseTo(35.6329, 2);

      createdVenueId = data.venue.id;
      createdTestVenueIds.push(createdVenueId);
    });

    it("E2E 7.2: Executes automated venue crawler pipeline with SHA-256 deduplication", async () => {
      // 1. Normalization & Fingerprint test
      const rawEvent: ScrapedEventRaw = {
        rawTitle: "International Robotics Expo 2026",
        venueSlug: "tokyo-big-sight",
        dateString: "2026-11-10",
        hallNames: ["East Hall 1", "East Hall 2"],
        category: "TECH_DEV_SUMMIT",
      };

      const normalized = normalizeScrapedEvent(rawEvent);
      expect(normalized.slug).toBe("international-robotics-expo-2026");
      expect(normalized.fingerprint.length).toBe(64); // SHA-256 length

      // 2. Deduplication check
      const fingerprints = new Set<string>();
      const batch1 = [normalized];
      const res1 = deduplicateEvents(fingerprints, batch1);
      expect(res1.stats.newCount).toBe(1);
      expect(res1.stats.duplicateCount).toBe(0);

      // Repeat with same fingerprint
      const res2 = deduplicateEvents(fingerprints, batch1);
      expect(res2.stats.newCount).toBe(0);
      expect(res2.stats.duplicateCount).toBe(1);
    });

    it("E2E 7.3: Runs crawler batch via POST /api/crawler in dryRun mode", async () => {
      const crawlReq = new NextRequest("http://localhost:3000/api/crawler", {
        method: "POST",
        body: JSON.stringify({
          venueSlugs: ["jiexpo-kemayoran", "tokyo-big-sight"],
          dryRun: true,
          persistToDb: false,
        }),
      });

      const res = await postCrawler(crawlReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("COMPLETED");
      expect(data.data.insertedCount).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // JOURNEY 8: PWA Web App Manifest, Service Worker & Schema.org JSON-LD SEO
  // ==========================================================================
  describe("Journey 8: PWA Manifest, Offline Service Worker & Schema.org JSON-LD Structured Data", () => {
    it("E2E 8.1: Validates PWA Web App Manifest structure, icons, and shortcuts", () => {
      const pwaManifest = manifest();
      expect(pwaManifest.name).toBe("XPO - MICE Digital Ecosystem");
      expect(pwaManifest.short_name).toBe("XPO");
      expect(pwaManifest.display).toBe("standalone");
      expect(pwaManifest.theme_color).toBe("#2563eb");
      expect(pwaManifest.icons?.length).toBeGreaterThanOrEqual(4);
      expect(pwaManifest.shortcuts?.length).toBeGreaterThanOrEqual(4);
    });

    it("E2E 8.2: Validates offline Service Worker script existence and caching rules", () => {
      const swPath = path.join(process.cwd(), "public", "sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, "utf-8");
      expect(swContent).toContain("xpo-mice-cache-v1");
      expect(swContent).toContain("caches.open");
      expect(swContent).toContain("fetch");
      expect(swContent).toContain("OFFLINE_FALLBACK_HTML");
    });

    it("E2E 8.3: Generates Schema.org Event, Place, BreadcrumbList, and WebSite JSON-LD", () => {
      // 1. Event JSON-LD
      const eventJson = generateEventJsonLd({
        title: "Asia AI Summit 2026",
        slug: "asia-ai-summit-2026",
        description: "Premier AI and Machine Learning Conference in Asia.",
        archetype: "TECH_DEV_SUMMIT",
        startDate: "2026-09-10T09:00:00Z",
        endDate: "2026-09-12T18:00:00Z",
        format: "HYBRID",
        venue: {
          name: "ICE BSD City",
          city: "Tangerang",
          address: "Jl. BSD Grand Boulevard No. 1",
          latitude: -6.3025,
          longitude: 106.6385,
          regionId: "id",
        },
        ticketTiers: [
          { name: "Full Summit Pass", price: 2500000, currency: "IDR" },
        ],
      });

      expect(eventJson["@context"]).toBe("https://schema.org");
      expect(eventJson["@type"]).toBe("BusinessEvent");
      expect(eventJson.name).toBe("Asia AI Summit 2026");
      expect(eventJson.eventAttendanceMode).toBe("https://schema.org/MixedEventAttendanceMode");

      // 2. Place JSON-LD
      const placeJson = generatePlaceJsonLd({
        name: "JIExpo Kemayoran",
        slug: "jiexpo-kemayoran",
        city: "Jakarta",
        address: "Gedung Pusat Niaga, Arena PRJ Kemayoran",
        latitude: -6.1472,
        longitude: 106.8488,
        regionId: "id",
        halls: [
          { name: "Hall A1", capacity: 5000, floorAreaSqm: 8000 },
          { name: "Hall B1", capacity: 4000, floorAreaSqm: 6500 },
        ],
      });

      expect(placeJson["@type"]).toBe("CivicStructure");
      expect(placeJson.maximumAttendeeCapacity).toBe(9000);
      expect(Array.isArray(placeJson.containsPlace)).toBe(true);

      // 3. BreadcrumbList JSON-LD
      const breadcrumbJson = generateBreadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Events", url: "/events" },
        { name: "Asia AI Summit 2026", url: "/events/asia-ai-summit-2026" },
      ]);
      expect(breadcrumbJson["@type"]).toBe("BreadcrumbList");
      expect((breadcrumbJson.itemListElement as any[]).length).toBe(3);

      // 4. WebSite JSON-LD
      const websiteJson = generateMiceWebsiteJsonLd();
      expect(websiteJson["@type"]).toBe("WebSite");
      expect(websiteJson.potentialAction).toBeDefined();
    });
  });
});
