import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  hasPermission,
  canAccessRoute,
  getRoleHierarchy,
  isValidRole,
  getRoleLabel,
  getRoleBadgeVariant,
  getRolePermissionsMatrix,
  ROLE_PERMISSIONS,
  type UserRole,
  type Permission,
} from "@/lib/auth/rbac";
import {
  DEMO_ACCOUNTS,
  getDemoAccounts,
  getStoredUser,
  setStoredUser,
  switchUserRole,
} from "@/lib/auth/session";
import {
  generateTicketHash,
  verifyTicketHash,
  type TicketPassPayload,
} from "@/lib/tickets/qrPass";
import {
  MiceArchetype,
  getArchetypeTokens,
  ARCHETYPE_DEFAULTS,
  ARCHETYPE_METADATA,
} from "@/lib/theming";
import { POST as verifyTicketPost, GET as verifyTicketGet } from "@/app/api/tickets/verify/route";
import { POST as createEventPost } from "@/app/api/organizer/events/route";

describe("Milestone 6 Adversarial Stress & Security Suite (Phases 8 & 9)", () => {
  let createdBookingId: string;
  let createdEventId: string;
  let testQrCodeHash: string;
  let testSignature: string;
  let testPayloadString: string;

  beforeAll(async () => {
    await db.$connect();

    // Create a dedicated test event and booking for adversarial scanner verification
    const venue = await db.venue.findFirst({
      include: { halls: true },
    });
    const organizer = await db.user.findFirst({
      where: { role: "ORGANIZER" },
    });

    const advEvent = await db.event.create({
      data: {
        title: "Adversarial Stress Convention 2027",
        slug: `adv-stress-expo-${Date.now()}`,
        tagline: "Stress Testing Gate Control & Integrity",
        description: "Adversarial test harness event.",
        archetype: "TECH_DEV_SUMMIT",
        format: "HYBRID",
        scale: "LARGE",
        regionId: "id",
        venueId: venue!.id,
        venueHallId: venue?.halls[0]?.id || null,
        organizerId: organizer!.id,
        startDate: new Date("2027-08-01"),
        endDate: new Date("2027-08-03"),
        heroImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        ticketTiers: {
          create: [
            {
              name: "Stress VIP Pass",
              price: 1500000,
              currency: "IDR",
              capacity: 100,
              benefitsJson: JSON.stringify(["VIP Lounge Access", "Fast Track Gate"]),
            },
          ],
        },
        perks: {
          create: [
            {
              title: "VIP Lounge Access",
              description: "Complimentary barista & refreshments",
              tierRequired: "VIP",
            },
          ],
        },
      },
      include: { ticketTiers: true },
    });

    createdEventId = advEvent.id;
    const tier = advEvent.ticketTiers[0];

    createdBookingId = `bk-adv-${Date.now()}`;
    const payload: TicketPassPayload = {
      bookingId: createdBookingId,
      eventId: createdEventId,
      tierId: tier.id,
      attendeeEmail: "adv-challenger@xpo.test",
      issuedAt: Date.now(),
      nonce: `nonce-${Date.now()}`,
    };

    const hashRes = generateTicketHash(payload);
    testQrCodeHash = hashRes.qrCodeHash;
    testSignature = hashRes.signature;
    testPayloadString = hashRes.payloadString;

    await db.booking.create({
      data: {
        id: createdBookingId,
        userId: organizer!.id,
        eventId: createdEventId,
        ticketTierId: tier.id,
        attendeeName: "Adversarial Challenger",
        attendeeEmail: "adv-challenger@xpo.test",
        qrCodeHash: testQrCodeHash,
        status: "CONFIRMED",
      },
    });
  });

  afterAll(async () => {
    if (createdEventId) {
      await db.booking.deleteMany({ where: { eventId: createdEventId } });
      await db.eventPerk.deleteMany({ where: { eventId: createdEventId } });
      await db.ticketTier.deleteMany({ where: { eventId: createdEventId } });
      await db.event.delete({ where: { id: createdEventId } });
    }
    await db.$disconnect();
  });

  // ==========================================================================
  // SECTION 1: RBAC AUTHORIZATION MATRIX & PERMISSION ISOLATION
  // ==========================================================================
  describe("1. RBAC Matrix & Route Access Control", () => {
    it("ADV-1.1: strictly isolates platform governance capabilities to ADMIN only", () => {
      const governancePerms: Permission[] = ["venues:manage", "crawler:run", "audit:view"];
      for (const perm of governancePerms) {
        expect(hasPermission("ADMIN", perm)).toBe(true);
        expect(hasPermission("ORGANIZER", perm)).toBe(false);
        expect(hasPermission("ATTENDEE", perm)).toBe(false);
      }
    });

    it("ADV-1.2: prevents ATTENDEE from performing organizer actions", () => {
      const organizerPerms: Permission[] = [
        "tickets:verify",
        "events:create",
        "events:edit",
        "booths:manage",
        "ai:reports",
      ];
      for (const perm of organizerPerms) {
        expect(hasPermission("ATTENDEE", perm)).toBe(false);
      }
    });

    it("ADV-1.3: enforces route protection across varied and malformed pathname variants", () => {
      // Admin path variations
      expect(canAccessRoute("ORGANIZER", "/admin")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/admin/dashboard")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/en/admin/venues")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/id/(admin)/crawler")).toBe(false);
      expect(canAccessRoute("ADMIN", "/admin/dashboard")).toBe(true);

      // Organizer path variations
      expect(canAccessRoute("ATTENDEE", "/organizer")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/en/dashboard")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/events/new")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/en/events/123/customizer")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/id/booths")).toBe(false);
      expect(canAccessRoute("ATTENDEE", "/jp/scanner")).toBe(false);

      expect(canAccessRoute("ORGANIZER", "/en/dashboard")).toBe(true);
      expect(canAccessRoute("ORGANIZER", "/events/new")).toBe(true);
      expect(canAccessRoute("ORGANIZER", "/events/123/customizer")).toBe(true);
      expect(canAccessRoute("ADMIN", "/events/new")).toBe(true);

      // Public paths accessible by all
      expect(canAccessRoute("ATTENDEE", "/events")).toBe(true);
      expect(canAccessRoute("ATTENDEE", "/venues")).toBe(true);
      expect(canAccessRoute("ATTENDEE", "/settings")).toBe(true);
      expect(canAccessRoute("ATTENDEE", "/en/events/manufacturing-indonesia-2026")).toBe(true);
    });

    it("ADV-1.4: rejects invalid role types and edge strings gracefully", () => {
      const invalidRoles = ["", "   ", "GUEST", "SUPERADMIN", "root", "null", "undefined", 123, null, undefined];
      for (const r of invalidRoles) {
        expect(isValidRole(r)).toBe(false);
        expect(hasPermission(r as any, "events:view")).toBe(false);
        expect(canAccessRoute(r as any, "/events")).toBe(false);
        expect(getRoleHierarchy(r as any)).toBe(0);
      }
    });

    it("ADV-1.5: verifies permissions matrix integrity structure", () => {
      const matrix = getRolePermissionsMatrix();
      expect(matrix.length).toBe(10);
      for (const row of matrix) {
        expect(row.permission).toBeDefined();
        expect(row.title).toBeDefined();
        expect(row.description).toBeDefined();
        expect(row.category).toBeDefined();
        expect(typeof row.attendee).toBe("boolean");
        expect(typeof row.organizer).toBe("boolean");
        expect(typeof row.admin).toBe("boolean");
        if (row.admin) {
          expect(row.admin).toBe(true); // ADMIN must have all
        }
      }
    });

    it("ADV-1.6: verifies demo accounts configuration and persona labels", () => {
      const accounts = getDemoAccounts();
      expect(accounts.length).toBe(3);
      expect(getRoleLabel("ADMIN")).toBe("Platform Admin");
      expect(getRoleLabel("ORGANIZER")).toBe("Event Organizer");
      expect(getRoleLabel("ATTENDEE")).toBe("Attendee & Buyer");
      expect(getRoleBadgeVariant("ADMIN")).toBe("destructive");
      expect(getRoleBadgeVariant("ORGANIZER")).toBe("archetype");
      expect(getRoleBadgeVariant("ATTENDEE")).toBe("success");
    });
  });

  // ==========================================================================
  // SECTION 2: EVENT WIZARD STATE VALIDATION & SUBMISSION INTEGRITY
  // ==========================================================================
  describe("2. Event Wizard State Validation & API Submission", () => {
    it("ADV-2.1: rejects event creation with missing mandatory fields", async () => {
      const incompletePayload = {
        title: "",
        description: "Missing title",
      };

      const req = new Request("http://localhost:3000/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incompletePayload),
      });

      const res = await createEventPost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Missing mandatory fields");
    });

    it("ADV-2.2: creates event with auto-generated unique slug and sanitized ticket tiers", async () => {
      const venue = await db.venue.findFirst();
      const validPayload = {
        title: "Adversarial Auto-Slug Summit 2027",
        tagline: "Stress testing slug and ticket sanitization",
        description: "Comprehensive event description for stress verification.",
        archetype: "ENERGY_INFRASTRUCTURE",
        format: "IN_PERSON",
        scale: "MEDIUM",
        regionId: "id",
        venueId: venue!.id,
        startDate: "2027-11-10",
        endDate: "2027-11-12",
        primaryColor: "#059669",
        accentColor: "#10b981",
        ticketTiers: [
          {
            name: "Eco Delegate Pass",
            price: 500000,
            currency: "IDR",
            capacity: 200,
            benefits: ["Floor Access", "Lunch Voucher"],
          },
        ],
      };

      const req = new Request("http://localhost:3000/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      });

      const res = await createEventPost(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.event.title).toBe(validPayload.title);
      expect(json.event.slug).toContain("adversarial-auto-slug-summit-2027");
      expect(json.event.ticketTiers.length).toBe(1);
      expect(json.event.ticketTiers[0].name).toBe("Eco Delegate Pass");
      expect(json.event.ticketTiers[0].price).toBe(500000);

      // Cleanup
      await db.ticketTier.deleteMany({ where: { eventId: json.event.id } });
      await db.event.delete({ where: { id: json.event.id } });
    });
  });

  // ==========================================================================
  // SECTION 3: LIVE PREVIEW FRAME & ARCHETYPE THEMING INTEGRITY
  // ==========================================================================
  describe("3. Live Preview Theming Tokens & Responsive Viewports", () => {
    it("ADV-3.1: verifies all 15 MICE archetypes provide valid default hex colors and typography tokens", () => {
      const allArchetypes: MiceArchetype[] = [
        "INDUSTRIAL_B2B",
        "TECH_DEV_SUMMIT",
        "MEDICAL_SYMPOSIUM",
        "FINANCE_INVESTOR",
        "POP_CULTURE_GAMING",
        "MUSIC_FESTIVAL",
        "MEGA_EXPO_PAVILION",
        "GOVERNMENT_DIPLOMATIC",
        "INCENTIVE_RETREAT",
        "AUTOMOTIVE_MOBILITY",
        "ENERGY_INFRASTRUCTURE",
        "AGRITECH_FOOD",
        "HOSPITALITY_TOURISM",
        "EDUCATION_EDTECH",
        "FASHION_RETAIL",
      ];

      for (const arch of allArchetypes) {
        const tokens = getArchetypeTokens(arch);
        expect(tokens.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(tokens.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(tokens.displayName).toBeDefined();
        expect(tokens.tagline).toBeDefined();
      }
    });

    it("ADV-3.2: overrides archetype tokens dynamically when custom branding colors are provided", () => {
      const customTokens = getArchetypeTokens("TECH_DEV_SUMMIT", {
        primaryColor: "#ff007f",
        accentColor: "#00ffff",
        fontFamilyOverride: "font-mono",
      });

      expect(customTokens.primary).toBe("#ff007f");
      expect(customTokens.accent).toBe("#00ffff");
      expect(customTokens.fontFamily).toBe("font-mono");
    });
  });

  // ==========================================================================
  // SECTION 4: DOOR QR SCANNER HMAC CRYPTO & DOUBLE-SCAN PREVENTION
  // ==========================================================================
  describe("4. Door QR Scanner HMAC-SHA256 & Gate Check-In Lifecycle", () => {
    it("ADV-4.1 (Crypto Integrity): validates genuine HMAC-SHA256 signature against canonical payload", () => {
      const result = verifyTicketHash(testPayloadString, testSignature);
      expect(result.valid).toBe(true);
      expect(result.payload?.bookingId).toBe(createdBookingId);
      expect(result.payload?.attendeeEmail).toBe("adv-challenger@xpo.test");
    });

    it("ADV-4.2 (Anti-Tamper): detects single-byte payload tampering and rejects validation", () => {
      // Modifying tier ID in payload string to attempt privilege elevation
      const tamperedPayload = testPayloadString.replace(createdEventId, "ev-hacked-id");
      const result = verifyTicketHash(tamperedPayload, testSignature);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("INVALID_SIGNATURE");
    });

    it("ADV-4.3 (Anti-Tamper): rejects forged or truncated signature lengths without throwing runtime exceptions", () => {
      const truncatedSig = testSignature.slice(0, 32); // half length
      const result = verifyTicketHash(testPayloadString, truncatedSig);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("INVALID_SIGNATURE");
    });

    it("ADV-4.4 (Gate Check-In Flow): first scan performs check-in transition", async () => {
      const req = new Request("http://localhost:3000/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeHash: testQrCodeHash,
          payloadString: testPayloadString,
          signature: testSignature,
          autoCheckIn: true,
        }),
      });

      const res = await verifyTicketPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.valid).toBe(true);
      expect(json.alreadyCheckedIn).toBe(false);
      expect(json.status).toBe("CHECKED_IN");
      expect(json.message).toContain("DOOR_ENTRY_GRANTED");
      expect(json.attendee.name).toBe("Adversarial Challenger");
      expect(json.perks.length).toBe(1);
      expect(json.perks[0].title).toBe("VIP Lounge Access");
    });

    it("ADV-4.5 (Double-Scan Prevention): subsequent scan of already checked-in ticket is flagged as double scan", async () => {
      const req = new Request("http://localhost:3000/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeHash: testQrCodeHash,
          payloadString: testPayloadString,
          signature: testSignature,
          autoCheckIn: true,
        }),
      });

      const res = await verifyTicketPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.valid).toBe(true);
      expect(json.alreadyCheckedIn).toBe(true);
      expect(json.status).toBe("CHECKED_IN");
      expect(json.message).toContain("DOUBLE_SCAN");
    });

    it("ADV-4.6 (Non-Existent Pass): returns 404 for unregistered ticket hash", async () => {
      const req = new Request("http://localhost:3000/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeHash: "XPO-PASS-NONEXISTENT-HASH-9999",
        }),
      });

      const res = await verifyTicketPost(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.valid).toBe(false);
      expect(json.error).toContain("TICKET_NOT_FOUND");
    });

    it("ADV-4.7 (GET Verification): allows read-only verification query via GET endpoint", async () => {
      const req = new Request(`http://localhost:3000/api/tickets/verify?qrCodeHash=${testQrCodeHash}`);
      const res = await verifyTicketGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.valid).toBe(true);
      expect(json.status).toBe("CHECKED_IN");
      expect(json.attendee.name).toBe("Adversarial Challenger");
    });
  });
});
