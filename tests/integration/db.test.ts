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

  it("carries the full up-to-date hall inventory for all three Japanese venues", async () => {
    const venues = await db.venue.findMany({
      where: { regionId: "jp" },
      include: { halls: true },
    });

    const names = (slug: string) =>
      venues.find((v) => v.slug === slug)?.halls.map((h) => h.name) ?? [];

    // Tokyo Big Sight: East, West, South and rooftop halls plus the Conference Tower rooms.
    const tokyo = names("tokyo-big-sight");
    expect(tokyo.length).toBeGreaterThanOrEqual(44);
    for (const hall of ["East Exhibition Hall 1", "East Exhibition Hall 7", "West Exhibition Hall 4", "South Exhibition Hall 2", "West Rooftop Exhibition Area", "Reception Hall A and B", "International Conference Room", "Ariake GYM-EX Exhibition Hall", "Conference Room 605", "VIP Room 805"]) {
      expect({ hall, present: tokyo.includes(hall) }).toEqual({ hall, present: true });
    }

    // Makuhari Messe: eleven numbered halls (not eight), the Event Hall and the conference rooms.
    const makuhari = names("makuhari-messe");
    expect(makuhari.length).toBeGreaterThanOrEqual(36);
    for (const hall of ["Exhibition Hall 9", "Exhibition Hall 11", "Makuhari Event Hall", "Convention Hall", "Conference Room 301", "VIP Reception Room 1"]) {
      expect({ hall, present: makuhari.includes(hall) }).toEqual({ hall, present: true });
    }

    // Pacifico Yokohama: National hall, four exhibition units, Conference Center, Annex and North.
    const pacifico = names("pacifico-yokohama");
    expect(pacifico.length).toBeGreaterThanOrEqual(80);
    for (const hall of ["National Convention Hall of Yokohama", "Exhibition Hall B", "Conference Center Main Hall", "Annex Hall F201-F206", "North G1-G8", "Conference Room 315", "North G303"]) {
      expect({ hall, present: pacifico.includes(hall) }).toEqual({ hall, present: true });
    }

    // The hall count behind every "N Halls" badge excludes meeting rooms.
    const counts: Record<string, { halls: number; meeting: number }> = {};
    for (const v of venues) {
      counts[v.slug] = {
        halls: v.halls.filter((h) => h.kind !== "MEETING_ROOM").length,
        meeting: v.halls.filter((h) => h.kind === "MEETING_ROOM").length,
      };
    }
    expect(counts).toEqual({
      "tokyo-big-sight": { halls: 23, meeting: 24 },
      "makuhari-messe": { halls: 14, meeting: 25 },
      "pacifico-yokohama": { halls: 9, meeting: 79 },
    });
  });

  it("carries the full up-to-date hall inventory for all three global venues", async () => {
    const venues = await db.venue.findMany({
      where: { regionId: "global" },
      include: { halls: true },
    });

    const names = (slug: string) =>
      venues.find((v) => v.slug === slug)?.halls.map((h) => h.name) ?? [];

    // Marina Bay Sands: six expo halls, ballrooms, theatre, plazas and meeting rooms.
    const mbs = names("marina-bay-sands-expo");
    expect(mbs.length).toBeGreaterThanOrEqual(36);
    for (const hall of ["Exhibition Hall A", "Exhibition Hall F", "Sands Grand Ballroom", "Sands Theatre", "Jasmine Ballroom", "Event Plaza D2", "Sands SkyPark Observation Deck", "Angsana Meeting Room"]) {
      expect({ hall, present: mbs.includes(hall) }).toEqual({ hall, present: true });
    }

    // Messe Frankfurt: numbered halls 1 through 12 (no 2 or 7), Forum, Congress Center and Agora.
    const frankfurt = names("messe-frankfurt");
    expect(frankfurt.length).toBeGreaterThanOrEqual(22);
    for (const hall of ["Exhibition Hall 1", "Festhalle", "Exhibition Hall 5", "Exhibition Hall 12", "Galleria", "Forum Saal Panorama", "CMF Harmonie Hall", "Kap Europa Horizont Hall", "Agora Open-Air Grounds"]) {
      expect({ hall, present: frankfurt.includes(hall) }).toEqual({ hall, present: true });
    }
    expect(frankfurt.some((h) => h === "Exhibition Hall 2" || h === "Exhibition Hall 7")).toBe(false);

    // ExCeL London: event halls, ICC complex, Maritime expansion and the named room groups.
    const excel = names("excel-london");
    expect(excel.length).toBeGreaterThanOrEqual(30);
    for (const hall of ["Event Halls North and South", "Hall Module N23", "ICC Auditorium", "ICC Capital Hall", "Platinum Suite", "ICC Maritime Hall 1", "ICC Maritime Suite", "Victoria Rooms", "Immerse LDN"]) {
      expect({ hall, present: excel.includes(hall) }).toEqual({ hall, present: true });
    }

    // The hall count behind every "N Halls" badge excludes meeting rooms.
    const counts: Record<string, { halls: number; meeting: number }> = {};
    for (const v of venues) {
      counts[v.slug] = {
        halls: v.halls.filter((h) => h.kind !== "MEETING_ROOM").length,
        meeting: v.halls.filter((h) => h.kind === "MEETING_ROOM").length,
      };
    }
    expect(counts).toEqual({
      "marina-bay-sands-expo": { halls: 23, meeting: 15 },
      "messe-frankfurt": { halls: 22, meeting: 1 },
      "excel-london": { halls: 18, meeting: 13 },
    });
  });

  it("marks meeting rooms with their kind and keeps them out of the hall count", async () => {
    const venues = await db.venue.findMany({
      where: { regionId: "id" },
      include: { halls: true },
    });

    const kinds = new Set(venues.flatMap((v) => v.halls.map((h) => h.kind)));
    expect(kinds.has("MEETING_ROOM")).toBe(true);

    // Spot checks: one named meeting room per venue carries the kind.
    const find = (slug: string, name: string) =>
      venues.find((v) => v.slug === slug)?.halls.find((h) => h.name === name)?.kind;
    expect(find("jiexpo-kemayoran", "Meeting Room 501")).toBe("MEETING_ROOM");
    expect(find("ice-bsd-city", "Garuda Main Hall 1")).toBe("MEETING_ROOM");
    expect(find("jcc-senayan", "Nuri Room 1")).toBe("MEETING_ROOM");
    expect(find("nice-pik-2", "Sadewa 6")).toBe("MEETING_ROOM");

    // Halls keep the default kind, including rooms with hall-like names.
    expect(find("jiexpo-kemayoran", "Hall A")).toBe("HALL");
    expect(find("ice-bsd-city", "Nusantara Hall")).toBe("HALL");

    // The hall count behind every "N Halls" badge excludes meeting rooms.
    const counts: Record<string, { halls: number; meeting: number }> = {};
    for (const v of venues) {
      counts[v.slug] = {
        halls: v.halls.filter((h) => h.kind !== "MEETING_ROOM").length,
        meeting: v.halls.filter((h) => h.kind === "MEETING_ROOM").length,
      };
    }
    expect(counts).toEqual({
      "jiexpo-kemayoran": { halls: 13, meeting: 31 },
      "ice-bsd-city": { halls: 12, meeting: 29 },
      "jcc-senayan": { halls: 8, meeting: 14 },
      "nice-pik-2": { halls: 14, meeting: 14 },
      "gbk-sports-complex": { halls: 16, meeting: 0 },
      "jis-jakarta": { halls: 5, meeting: 6 },
    });
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
