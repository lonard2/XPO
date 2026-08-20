import { describe, it, expect } from "vitest";
import {
  normalizeScrapedEvent,
  normalizeEventSlug,
  computeEventFingerprint,
  deduplicateEvents,
  type ScrapedEventRaw,
  type NormalizedEvent,
} from "../../helpers/contracts";

describe("Phase 11 Unit: Venue Crawler & Event Deduplication Pipeline", () => {
  const sampleRawEvents: ScrapedEventRaw[] = [
    {
      rawTitle: "IndoBuildTech Expo 2026",
      venueSlug: "ice-bsd-city",
      dateString: "10-14 Juni 2026",
      hallNames: ["Hall 5", "Hall 6", "Hall 7"],
      category: "INDUSTRIAL_B2B",
    },
    {
      rawTitle: "Jakarta International Java Jazz Festival 2026",
      venueSlug: "jiexpo-kemayoran",
      dateString: "29-31 Mei 2026",
      hallNames: ["Hall D2", "Open Space Arena"],
      category: "MUSIC_FESTIVAL",
    },
    {
      rawTitle: "Comic Frontier 20 (Comifuro 20)",
      venueSlug: "ice-bsd-city",
      dateString: "18-19 Juli 2026",
      hallNames: ["Hall 8", "Hall 9", "Hall 10"],
      category: "POP_CULTURE_GAMING",
    },
  ];

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================================================

  it("T1.1: converts raw event titles into URL-safe canonical slugs", () => {
    expect(normalizeEventSlug("IndoBuildTech Expo 2026")).toBe("indobuildtech-expo-2026");
    expect(normalizeEventSlug("Comic Frontier 20 (Comifuro 20!)")).toBe("comic-frontier-20-comifuro-20");
    expect(normalizeEventSlug("  Pekan Raya Jakarta / PRJ 2026  ")).toBe("pekan-raya-jakarta-prj-2026");
  });

  it("T1.2: calculates deterministic SHA-256 fingerprint from venue, title, and date", () => {
    const date = new Date(2026, 5, 10);
    const fp1 = computeEventFingerprint("ice-bsd-city", "IndoBuildTech Expo 2026", date);
    const fp2 = computeEventFingerprint("ice-bsd-city", "IndoBuildTech Expo 2026", date);

    expect(fp1).toHaveLength(64); // 256-bit hex
    expect(fp1).toBe(fp2);

    // Changing venue or title must alter fingerprint
    const fpDifferentVenue = computeEventFingerprint("jiexpo-kemayoran", "IndoBuildTech Expo 2026", date);
    expect(fp1).not.toBe(fpDifferentVenue);
  });

  it("T1.3: normalizes raw scraped data into structured event objects", () => {
    const normalized = normalizeScrapedEvent(sampleRawEvents[0]);

    expect(normalized.title).toBe("IndoBuildTech Expo 2026");
    expect(normalized.slug).toBe("indobuildtech-expo-2026");
    expect(normalized.venueSlug).toBe("ice-bsd-city");
    expect(normalized.halls).toEqual(["Hall 5", "Hall 6", "Hall 7"]);
    expect(normalized.archetype).toBe("INDUSTRIAL_B2B");
    expect(normalized.fingerprint).toBeDefined();
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
      venueSlug: "jcc-senayan",
      dateString: "15-18 Agustus 2026",
      hallNames: [],
      category: "GOVERNMENT_DIPLOMATIC",
    };

    const normalized = normalizeScrapedEvent(rawWithoutHalls);
    expect(normalized.halls).toEqual(["Main Exhibition Hall"]);
    expect(normalized.archetype).toBe("GOVERNMENT_DIPLOMATIC");
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & ADVERSARIAL EDGE CASES
  // ==========================================================================

  it("T2.1 (Case & Whitespace Invariance): matches duplicates despite casing and extra whitespace variations", () => {
    const date = new Date(2026, 5, 10);
    const fpLower = computeEventFingerprint("ice-bsd-city", "indobuildtech expo 2026", date);
    const fpUpper = computeEventFingerprint("ice-bsd-city", "  INDOBUILDTECH EXPO 2026  ", date);

    expect(fpLower).toBe(fpUpper);
  });

  it("T2.2 (Empty Array): handles empty crawl payloads without errors", () => {
    const existing = new Set<string>();
    const result = deduplicateEvents(existing, []);

    expect(result.toInsert).toHaveLength(0);
    expect(result.toSkip).toHaveLength(0);
    expect(result.stats.total).toBe(0);
  });

  it("T2.3 (Intra-batch Duplicates): catches duplicate items occurring within the same crawl payload", () => {
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
