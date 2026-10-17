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

  it("carries the full up-to-date hall inventory for all six Indonesian venues", async () => {
    const venues = await db.venue.findMany({
      where: { regionId: "id" },
      include: { halls: true },
    });

    const names = (slug: string) =>
      venues.find((v) => v.slug === slug)?.halls.map((h) => h.name) ?? [];

    // JIExpo: 7 numbered halls, Gambir, Open Space, ballrooms, theatre, 31 meeting
    // rooms and the New Hall under construction.
    const jiexpo = names("jiexpo-kemayoran");
    expect(jiexpo.length).toBeGreaterThanOrEqual(40);
    for (const hall of ["Hall A", "Hall B", "Hall C", "Hall B3", "Hall C3", "Hall D1", "Hall D2", "Gambir Expo", "Open Space", "JIExpo Theatre", "Meeting Room 501", "Semeru 1", "New Hall (Levels 1A and 1B)"]) {
      expect({ hall, present: jiexpo.includes(hall) }).toEqual({ hall, present: true });
    }

    // ICE BSD: 10 numbered halls plus Nusantara, 29 meeting rooms and outdoor space.
    const ice = names("ice-bsd-city");
    expect(ice.length).toBeGreaterThanOrEqual(38);
    expect(ice).toContain("Exhibition Hall 1");
    expect(ice).toContain("Exhibition Hall 10");
    expect(ice).toContain("Garuda Main Hall 1");
    expect(ice).toContain("Cendana 2");
    expect(ice).toContain("Kalimaya 3");
    expect(ice.some((h) => h.includes("Nusantara"))).toBe(true);

    // JICC: plenary, assembly, exhibition halls, lobby, breakout rooms and outdoor.
    const jicc = names("jcc-senayan");
    expect(jicc.length).toBeGreaterThanOrEqual(20);
    for (const hall of ["Assembly Hall", "Exhibition Hall B", "Main Lobby", "Merak Room", "Merak Room 1", "Nuri Room 1", "Kakatua Room", "Summit Lounge"]) {
      expect(jicc).toContain(hall);
    }

    // NICE PIK 2: 11 numbered halls (no Hall 4) plus convention, meeting and outdoor spaces.
    const nice = names("nice-pik-2");
    expect(nice.length).toBeGreaterThanOrEqual(26);
    expect(nice).toContain("Exhibition Hall 11");
    expect(nice).toContain("Sriwijaya Convention Hall");
    expect(nice).toContain("Nakula 1");
    expect(nice).toContain("Sadewa 6");
    expect(nice.some((h) => h.includes("Hall 4"))).toBe(false);

    // GBK: stadium, arena, halls, fields, festival grounds and function buildings.
    const gbk = names("gbk-sports-complex");
    expect(gbk.length).toBeGreaterThanOrEqual(14);
    for (const hall of ["Stadion Utama GBK", "Indonesia Arena", "Istora Senayan", "Aquatic Stadium", "Gedung Serbaguna"]) {
      expect(gbk).toContain(hall);
    }

    // JIS: bowl, sky deck, training fields, hospitality and plaza.
    const jis = names("jis-jakarta");
    expect(jis.length).toBeGreaterThanOrEqual(8);
    expect(jis).toContain("Main Stadium Bowl");
    expect(jis).toContain("Sky View Deck");
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
