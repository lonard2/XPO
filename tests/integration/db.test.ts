import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";

describe("Phase 2 Integration: Relational Data Models & Venue Ingestion", () => {
  beforeAll(async () => {
    // Ensure DB is accessible
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("retrieves the 3 core regions: Indonesia (id), Japan (jp), and Global (global)", async () => {
    const regions = await db.region.findMany();
    expect(regions.length).toBeGreaterThanOrEqual(3);

    const regionIds = regions.map((r) => r.id);
    expect(regionIds).toContain("id");
    expect(regionIds).toContain("jp");
    expect(regionIds).toContain("global");
  });

  it("retrieves Indonesian venues with exact halls and transit information", async () => {
    const venues = await db.venue.findMany({
      where: { regionId: "id" },
      include: { halls: true },
    });

    expect(venues.length).toBeGreaterThanOrEqual(6);

    const jiexpo = venues.find((v) => v.slug === "jiexpo-kemayoran");
    expect(jiexpo).toBeDefined();
    expect(jiexpo?.transitInfo).toContain("TransJakarta");
    expect(jiexpo?.halls.length).toBeGreaterThanOrEqual(5);

    const iceBsd = venues.find((v) => v.slug === "ice-bsd-city");
    expect(iceBsd).toBeDefined();
    expect(iceBsd?.halls.some((h) => h.name.includes("Nusantara"))).toBe(true);

    const jicc = venues.find((v) => v.slug === "jcc-senayan");
    expect(jicc).toBeDefined();
    expect(jicc?.halls.some((h) => h.name.includes("Plenary"))).toBe(true);
  });

  it("retrieves seeded events with relational ticket tiers, agenda items, and perks", async () => {
    const events = await db.event.findMany({
      include: {
        venue: true,
        ticketTiers: true,
        agendaItems: true,
        booths: true,
        perks: true,
      },
    });

    expect(events.length).toBeGreaterThanOrEqual(3);

    const mfgEvent = events.find((e) => e.slug === "manufacturing-indonesia-2026");
    expect(mfgEvent).toBeDefined();
    expect(mfgEvent?.archetype).toBe("INDUSTRIAL_B2B");
    expect(mfgEvent?.ticketTiers.length).toBeGreaterThanOrEqual(3);
    expect(mfgEvent?.agendaItems.length).toBeGreaterThanOrEqual(2);
    expect(mfgEvent?.booths.length).toBeGreaterThanOrEqual(3);
    expect(mfgEvent?.perks.length).toBeGreaterThanOrEqual(2);

    const megaExpoEvent = events.find((e) => e.slug === "pekan-raya-jakarta-2026");
    expect(megaExpoEvent).toBeDefined();
    expect(megaExpoEvent?.archetype).toBe("MEGA_EXPO_PAVILION");
  });

  it("verifies user booking with cryptographic hash and AI report generation link", async () => {
    const booking = await db.booking.findFirst({
      include: { user: true, event: true, ticketTier: true },
    });

    expect(booking).toBeDefined();
    expect(booking?.qrCodeHash).toContain("XPO-PASS");
    expect(booking?.user.email).toBe("alex@xpo.com");

    const aiReport = await db.aIReport.findFirst({
      include: { event: true, author: true },
    });

    expect(aiReport).toBeDefined();
    expect(aiReport?.modelUsed).toBe("google/gemini-3.7-flash");
    expect(aiReport?.reportType).toBe("DAILY_DIGEST");
  });
});
