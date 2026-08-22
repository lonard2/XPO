import { describe, it, expect, beforeEach } from "vitest";
import {
  normalizeScrapedEvent,
  normalizeEventSlug,
  computeEventFingerprint,
  deduplicateEvents,
  runVenueCrawlerBatch,
  getCrawlHistory,
  clearCrawlHistory,
  VENUE_SCRAPER_SOURCES,
  type ScrapedEventRaw,
  type NormalizedEvent,
} from "@/lib/crawler/venueScraper";

describe("Phase 11 Unit: Venue Crawler & Ingestion Pipeline Engine", () => {
  beforeEach(() => {
    clearCrawlHistory();
  });

  const sampleRawEvents: ScrapedEventRaw[] = [
    {
      rawTitle: "IndoBuildTech Expo 2026",
      venueSlug: "ice-bsd-city",
      dateString: "2026-06-10 to 2026-06-14",
      hallNames: ["Hall 5", "Hall 6", "Hall 7"],
      category: "INDUSTRIAL_B2B",
      description: "Indonesia's largest building and architecture trade show.",
      organizerName: "Debindo ITE",
      scale: "GLOBAL_MEGA",
      format: "IN_PERSON",
      estimatedPrice: 0,
      currency: "IDR",
    },
    {
      rawTitle: "Tokyo International Robotics Expo 2026",
      venueSlug: "tokyo-big-sight",
      dateString: "2026-09-15 to 2026-09-18",
      hallNames: ["East Hall 1", "East Hall 2"],
      category: "TECH_DEV_SUMMIT",
      description: "Robotics and AI manufacturing summit.",
      organizerName: "Japan Robot Association",
      scale: "GLOBAL_MEGA",
      format: "HYBRID",
      estimatedPrice: 3000,
      currency: "JPY",
    },
    {
      rawTitle: "Asia-Pacific FinTech Summit 2026",
      venueSlug: "marina-bay-sands-expo",
      dateString: "2026-11-10 to 2026-11-12",
      hallNames: ["Sands Ballroom", "Hall A"],
      category: "FINANCE_INVESTOR",
      description: "Institutional finance and digital asset congress.",
      organizerName: "Global Finance Forum",
      scale: "LARGE",
      format: "HYBRID",
      estimatedPrice: 450,
      currency: "USD",
    },
  ];

  it("T1.1: converts raw event titles into URL-safe canonical slugs", () => {
    expect(normalizeEventSlug("IndoBuildTech Expo 2026")).toBe("indobuildtech-expo-2026");
    expect(normalizeEventSlug("Tokyo International Robotics & AI Expo 2026!")).toBe("tokyo-international-robotics-ai-expo-2026");
    expect(normalizeEventSlug("  Pekan Raya Jakarta / PRJ 2026  ")).toBe("pekan-raya-jakarta-prj-2026");
  });

  it("T1.2: calculates deterministic SHA-256 fingerprint from venue, title, and date", () => {
    const date = new Date(2026, 5, 10);
    const fp1 = computeEventFingerprint("ice-bsd-city", "IndoBuildTech Expo 2026", date);
    const fp2 = computeEventFingerprint("ice-bsd-city", "IndoBuildTech Expo 2026", date);

    expect(fp1).toHaveLength(64); // 256-bit hex
    expect(fp1).toBe(fp2);

    const fpDiffVenue = computeEventFingerprint("jiexpo-kemayoran", "IndoBuildTech Expo 2026", date);
    expect(fp1).not.toBe(fpDiffVenue);
  });

  it("T1.3: normalizes raw scraped data into structured MICE domain objects", () => {
    const normalized = normalizeScrapedEvent(sampleRawEvents[0]);

    expect(normalized.title).toBe("IndoBuildTech Expo 2026");
    expect(normalized.slug).toBe("indobuildtech-expo-2026");
    expect(normalized.venueSlug).toBe("ice-bsd-city");
    expect(normalized.halls).toEqual(["Hall 5", "Hall 6", "Hall 7"]);
    expect(normalized.archetype).toBe("INDUSTRIAL_B2B");
    expect(normalized.organizerName).toBe("Debindo ITE");
    expect(normalized.scale).toBe("GLOBAL_MEGA");
    expect(normalized.format).toBe("IN_PERSON");
    expect(normalized.fingerprint).toBeDefined();
    expect(normalized.fingerprint).toHaveLength(64);
  });

  it("T1.4: accurately partitions batch into new inserts and skipped duplicates", () => {
    const normalizedList = sampleRawEvents.map(normalizeScrapedEvent);
    const existingFingerprints = new Set<string>();

    // First run: all 3 should be inserted
    const resultRun1 = deduplicateEvents(existingFingerprints, normalizedList);
    expect(resultRun1.toInsert).toHaveLength(3);
    expect(resultRun1.toSkip).toHaveLength(0);
    expect(resultRun1.stats.newCount).toBe(3);
    expect(resultRun1.stats.duplicateCount).toBe(0);

    // Second run: with same fingerprints, all 3 should be skipped
    const resultRun2 = deduplicateEvents(existingFingerprints, normalizedList);
    expect(resultRun2.toInsert).toHaveLength(0);
    expect(resultRun2.toSkip).toHaveLength(3);
    expect(resultRun2.stats.newCount).toBe(0);
    expect(resultRun2.stats.duplicateCount).toBe(3);
  });

  it("T1.5: defaults missing halls to a sensible fallback", () => {
    const rawWithoutHalls: ScrapedEventRaw = {
      rawTitle: "Global Diplomatic Summit 2026",
      venueSlug: "jicc-senayan",
      dateString: "2026-08-15 to 2026-08-18",
      hallNames: [],
      category: "GOVERNMENT_DIPLOMATIC",
    };

    const normalized = normalizeScrapedEvent(rawWithoutHalls);
    expect(normalized.halls).toEqual(["Main Exhibition Hall"]);
    expect(normalized.archetype).toBe("GOVERNMENT_DIPLOMATIC");
  });

  it("T1.6: executes batch crawler run in dry-run mode and updates history registry", async () => {
    const record = await runVenueCrawlerBatch({
      venueSlugs: ["jiexpo-kemayoran", "ice-bsd-city"],
      dryRun: true,
      persistToDb: false,
    });

    expect(record.runId).toMatch(/^CRAWL-/);
    expect(record.totalScraped).toBeGreaterThan(0);
    expect(record.insertedCount).toBeGreaterThan(0);
    expect(record.venueSlugsScraped).toContain("jiexpo-kemayoran");
    expect(record.venueSlugsScraped).toContain("ice-bsd-city");
    expect(record.status).toBe("COMPLETED");

    const history = getCrawlHistory();
    expect(history.length).toBe(1);
    expect(history[0].runId).toBe(record.runId);
  });

  it("T1.7: verifies registered venue scraper feeds exist for all 3 regions", () => {
    const venueKeys = Object.keys(VENUE_SCRAPER_SOURCES);
    expect(venueKeys.length).toBeGreaterThanOrEqual(6);

    const indonesian = venueKeys.filter((k) => VENUE_SCRAPER_SOURCES[k].regionCode === "id");
    const japanese = venueKeys.filter((k) => VENUE_SCRAPER_SOURCES[k].regionCode === "jp");
    const globalHubs = venueKeys.filter((k) => VENUE_SCRAPER_SOURCES[k].regionCode === "global");

    expect(indonesian.length).toBeGreaterThanOrEqual(2);
    expect(japanese.length).toBeGreaterThanOrEqual(1);
    expect(globalHubs.length).toBeGreaterThanOrEqual(3);
  });

  // Edge cases
  it("T2.1: matches duplicates despite casing and extra whitespace variations", () => {
    const date = new Date(2026, 5, 10);
    const fpLower = computeEventFingerprint("ice-bsd-city", "indobuildtech expo 2026", date);
    const fpUpper = computeEventFingerprint("ice-bsd-city", "  INDOBUILDTECH EXPO 2026  ", date);

    expect(fpLower).toBe(fpUpper);
  });

  it("T2.2: handles empty crawl payloads without errors", () => {
    const existing = new Set<string>();
    const result = deduplicateEvents(existing, []);

    expect(result.toInsert).toHaveLength(0);
    expect(result.toSkip).toHaveLength(0);
    expect(result.stats.total).toBe(0);
  });

  it("T2.3: catches duplicate items occurring within the same crawl payload", () => {
    const eventA = normalizeScrapedEvent(sampleRawEvents[0]);
    const eventADuplicate = normalizeScrapedEvent({ ...sampleRawEvents[0] });

    const existing = new Set<string>();
    const result = deduplicateEvents(existing, [eventA, eventADuplicate]);

    expect(result.toInsert).toHaveLength(1);
    expect(result.toSkip).toHaveLength(1);
    expect(result.stats.newCount).toBe(1);
    expect(result.stats.duplicateCount).toBe(1);
  });
});
