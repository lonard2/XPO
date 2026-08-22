import * as crypto from "crypto";
import { db } from "@/lib/db";
import { type MiceArchetype } from "@/lib/theming";

// ============================================================================
// DATA TYPES & INTERFACES
// ============================================================================

export interface ScrapedEventRaw {
  rawTitle: string;
  venueSlug: string;
  dateString: string;
  hallNames: string[];
  category?: string;
  description?: string;
  organizerName?: string;
  scale?: "GLOBAL_MEGA" | "LARGE" | "MEDIUM" | "EXECUTIVE";
  format?: "IN_PERSON" | "HYBRID" | "VIRTUAL";
  heroImageUrl?: string;
  estimatedPrice?: number;
  currency?: string;
}

export interface NormalizedEvent {
  title: string;
  slug: string;
  venueSlug: string;
  startDate: Date;
  endDate: Date;
  halls: string[];
  archetype: MiceArchetype;
  description: string;
  organizerName: string;
  scale: "GLOBAL_MEGA" | "LARGE" | "MEDIUM" | "EXECUTIVE";
  format: "IN_PERSON" | "HYBRID" | "VIRTUAL";
  heroImageUrl?: string;
  estimatedPrice: number;
  currency: string;
  fingerprint: string;
}

export interface DeduplicationResult {
  toInsert: NormalizedEvent[];
  toSkip: NormalizedEvent[];
  stats: {
    total: number;
    newCount: number;
    duplicateCount: number;
  };
}

export interface CrawlBatchOptions {
  venueSlugs?: string[];
  dryRun?: boolean;
  persistToDb?: boolean;
}

export interface CrawlRunRecord {
  runId: string;
  timestamp: string;
  venueSlugsScraped: string[];
  totalScraped: number;
  insertedCount: number;
  skippedDuplicatesCount: number;
  durationMs: number;
  status: "COMPLETED" | "PARTIAL" | "FAILED";
  errors: string[];
  events: {
    title: string;
    venueSlug: string;
    action: "INSERTED" | "SKIPPED_DUPLICATE";
    fingerprint: string;
  }[];
}

// In-memory crawl run registry
const CRAWL_HISTORY_REGISTRY: CrawlRunRecord[] = [];

// ============================================================================
// NORMALIZATION & FINGERPRINTING UTILITIES
// ============================================================================

/**
 * Converts raw event titles into URL-safe canonical slugs.
 */
export function normalizeEventSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculates a deterministic SHA-256 fingerprint from venueSlug, title, and startDate.
 * Invariant: Identical venue + normalized title + start date yields identical fingerprint.
 */
export function computeEventFingerprint(venueSlug: string, title: string, startDate: Date): string {
  const normVenue = venueSlug.toLowerCase().trim();
  const normTitle = title.toLowerCase().trim();
  const normDate = startDate.toISOString().split("T")[0];
  return crypto
    .createHash("sha256")
    .update(`${normVenue}:${normTitle}:${normDate}`)
    .digest("hex");
}

/**
 * Parses date string or creates realistic deterministic upcoming date windows.
 */
export function parseScrapedDateRange(dateString?: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  
  if (!dateString) {
    const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 18, 18, 0, 0);
    return { startDate, endDate };
  }

  // Attempt to parse standard date strings (e.g. "2026-09-10 to 2026-09-14" or "10-14 Juni 2026")
  const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/g);
  if (isoMatch && isoMatch.length >= 2) {
    return {
      startDate: new Date(isoMatch[0]),
      endDate: new Date(isoMatch[1]),
    };
  }

  // Fallback to stable future window based on dateString hash
  const hash = crypto.createHash("md5").update(dateString).digest("hex");
  const monthOffset = (parseInt(hash.slice(0, 2), 16) % 6) + 1;
  const dayStart = (parseInt(hash.slice(2, 4), 16) % 20) + 1;
  const durationDays = (parseInt(hash.slice(4, 6), 16) % 4) + 2;

  const startDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, dayStart, 9, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, dayStart + durationDays, 18, 0, 0);

  return { startDate, endDate };
}

/**
 * Normalizes raw scraped event data into a validated MICE domain object.
 */
export function normalizeScrapedEvent(raw: ScrapedEventRaw): NormalizedEvent {
  const title = raw.rawTitle.trim();
  const slug = normalizeEventSlug(title);
  const { startDate, endDate } = parseScrapedDateRange(raw.dateString);
  const halls = raw.hallNames && raw.hallNames.length > 0 ? raw.hallNames : ["Main Exhibition Hall"];
  const archetype = (raw.category as MiceArchetype) || "INDUSTRIAL_B2B";
  const fingerprint = computeEventFingerprint(raw.venueSlug, title, startDate);

  return {
    title,
    slug,
    venueSlug: raw.venueSlug,
    startDate,
    endDate,
    halls,
    archetype,
    description: raw.description || `Premier international convention and trade exhibition scheduled at ${raw.venueSlug}.`,
    organizerName: raw.organizerName || "International MICE Federation",
    scale: raw.scale || "LARGE",
    format: raw.format || "IN_PERSON",
    heroImageUrl: raw.heroImageUrl,
    estimatedPrice: raw.estimatedPrice ?? 250000,
    currency: raw.currency || (raw.venueSlug.includes("tokyo") ? "JPY" : raw.venueSlug.includes("ice") || raw.venueSlug.includes("jiexpo") ? "IDR" : "USD"),
    fingerprint,
  };
}

/**
 * Partitions incoming batch into new inserts and duplicates using fingerprint set.
 */
export function deduplicateEvents(
  existingFingerprints: Set<string>,
  incoming: NormalizedEvent[]
): DeduplicationResult {
  const toInsert: NormalizedEvent[] = [];
  const toSkip: NormalizedEvent[] = [];

  for (const item of incoming) {
    if (existingFingerprints.has(item.fingerprint)) {
      toSkip.push(item);
    } else {
      toInsert.push(item);
      existingFingerprints.add(item.fingerprint);
    }
  }

  return {
    toInsert,
    toSkip,
    stats: {
      total: incoming.length,
      newCount: toInsert.length,
      duplicateCount: toSkip.length,
    },
  };
}

// ============================================================================
// SIMULATED MICE VENUE FEEDS (REGIONAL & GLOBAL CONVENTION CENTERS)
// ============================================================================

export const VENUE_SCRAPER_SOURCES: Record<string, { venueName: string; regionCode: string; feed: ScrapedEventRaw[] }> = {
  "jiexpo-kemayoran": {
    venueName: "JIExpo Kemayoran",
    regionCode: "id",
    feed: [
      {
        rawTitle: "Jakarta International Expo & Trade Fair 2026",
        venueSlug: "jiexpo-kemayoran",
        dateString: "2026-06-10 to 2026-06-25",
        hallNames: ["Hall A1", "Hall A2", "Hall A3", "Open Space Arena"],
        category: "MEGA_EXPO_PAVILION",
        description: "Southeast Asia's premier consumer and trade fair celebrating multi-pavilion commerce and culture.",
        organizerName: "PT Jakarta International Expo",
        scale: "GLOBAL_MEGA",
        format: "IN_PERSON",
        estimatedPrice: 50000,
        currency: "IDR",
      },
      {
        rawTitle: "Indo Fastener & Hardware Expo 2026",
        venueSlug: "jiexpo-kemayoran",
        dateString: "2026-08-12 to 2026-08-15",
        hallNames: ["Hall B1", "Hall B2"],
        category: "INDUSTRIAL_B2B",
        description: "Specialized industrial fastener, tooling, and machinery components procurement expo.",
        organizerName: "IndoTrade Exhibitions",
        scale: "LARGE",
        format: "IN_PERSON",
        estimatedPrice: 0,
        currency: "IDR",
      },
      {
        rawTitle: "Java Jazz International Festival 2026",
        venueSlug: "jiexpo-kemayoran",
        dateString: "2026-05-29 to 2026-05-31",
        hallNames: ["Hall D2", "Open Space Arena"],
        category: "MUSIC_FESTIVAL",
        description: "World-renowned international music festival with 11 live stages across the complex.",
        organizerName: "Java Festival Production",
        scale: "LARGE",
        format: "IN_PERSON",
        estimatedPrice: 850000,
        currency: "IDR",
      },
    ],
  },
  "ice-bsd-city": {
    venueName: "ICE BSD City",
    regionCode: "id",
    feed: [
      {
        rawTitle: "IndoBuildTech Expo 2026",
        venueSlug: "ice-bsd-city",
        dateString: "2026-06-10 to 2026-06-14",
        hallNames: ["Hall 5", "Hall 6", "Hall 7"],
        category: "INDUSTRIAL_B2B",
        description: "Indonesia's largest building material, architecture, and interior exhibition.",
        organizerName: "Debindo ITE",
        scale: "GLOBAL_MEGA",
        format: "IN_PERSON",
        estimatedPrice: 0,
        currency: "IDR",
      },
      {
        rawTitle: "Comic Frontier 20 (Comifuro 20)",
        venueSlug: "ice-bsd-city",
        dateString: "2026-07-18 to 2026-07-19",
        hallNames: ["Hall 8", "Hall 9", "Hall 10"],
        category: "POP_CULTURE_GAMING",
        description: "Massive pop culture, creator alley, cosplay, and gaming enthusiast assembly.",
        organizerName: "Comifuro Creative Committee",
        scale: "LARGE",
        format: "IN_PERSON",
        estimatedPrice: 75000,
        currency: "IDR",
      },
      {
        rawTitle: "Gaikindo Indonesia International Auto Show (GIIAS) 2026",
        venueSlug: "ice-bsd-city",
        dateString: "2026-08-06 to 2026-08-16",
        hallNames: ["Hall 1", "Hall 2", "Hall 3", "Hall 5", "Hall 6", "Hall 7", "Hall 8", "Hall 9", "Hall 10"],
        category: "INDUSTRIAL_B2B",
        description: "Flagship automotive exhibition spotlighting next-generation electric vehicles and concept debuts.",
        organizerName: "Seven Event / GAIKINDO",
        scale: "GLOBAL_MEGA",
        format: "IN_PERSON",
        estimatedPrice: 100000,
        currency: "IDR",
      },
    ],
  },
  "tokyo-big-sight": {
    venueName: "Tokyo Big Sight",
    regionCode: "jp",
    feed: [
      {
        rawTitle: "Tokyo International Robotics & AI Expo 2026",
        venueSlug: "tokyo-big-sight",
        dateString: "2026-09-15 to 2026-09-18",
        hallNames: ["East Hall 1", "East Hall 2", "East Hall 3"],
        category: "TECH_DEV_SUMMIT",
        description: "Global robotics manufacturing summit featuring industrial arm robotics and AI vision systems.",
        organizerName: "Japan Robot Association",
        scale: "GLOBAL_MEGA",
        format: "HYBRID",
        estimatedPrice: 3000,
        currency: "JPY",
      },
      {
        rawTitle: "AnimeJapan Grand Showcase 2027",
        venueSlug: "tokyo-big-sight",
        dateString: "2027-03-20 to 2027-03-23",
        hallNames: ["East Hall 4", "East Hall 5", "East Hall 6"],
        category: "POP_CULTURE_GAMING",
        description: "World's flagship anime and animation industry congress with studio showcases and voice actor stages.",
        organizerName: "AnimeJapan Executive Committee",
        scale: "GLOBAL_MEGA",
        format: "IN_PERSON",
        estimatedPrice: 2500,
        currency: "JPY",
      },
    ],
  },
  "marina-bay-sands-expo": {
    venueName: "Marina Bay Sands Expo",
    regionCode: "global",
    feed: [
      {
        rawTitle: "Asia-Pacific FinTech & Sovereign Capital Summit 2026",
        venueSlug: "marina-bay-sands-expo",
        dateString: "2026-11-10 to 2026-11-12",
        hallNames: ["Sands Grand Ballroom", "Hall A", "Hall B"],
        category: "FINANCE_INVESTOR",
        description: "High-level institutional finance congress with sovereign wealth deal-rooms and digital asset panels.",
        organizerName: "MAS & Global Finance Forum",
        scale: "GLOBAL_MEGA",
        format: "HYBRID",
        estimatedPrice: 450,
        currency: "USD",
      },
      {
        rawTitle: "World Medical Robotics & Surgical Symposium 2026",
        venueSlug: "marina-bay-sands-expo",
        dateString: "2026-10-05 to 2026-10-08",
        hallNames: ["Hall C", "Hall D"],
        category: "MEDICAL_SYMPOSIUM",
        description: "Peer-reviewed medical congress covering minimally invasive robotic surgery with CME credit tracks.",
        organizerName: "International College of Surgeons",
        scale: "LARGE",
        format: "HYBRID",
        estimatedPrice: 600,
        currency: "USD",
      },
    ],
  },
  "messe-frankfurt": {
    venueName: "Messe Frankfurt",
    regionCode: "global",
    feed: [
      {
        rawTitle: "Frankfurt Global Industry & Energy Trade Fair 2026",
        venueSlug: "messe-frankfurt",
        dateString: "2026-09-22 to 2026-09-25",
        hallNames: ["Hall 3.0", "Hall 3.1", "Hall 4.0"],
        category: "INDUSTRIAL_B2B",
        description: "Leading European industrial automation, energy grid, and factory digitization trade fair.",
        organizerName: "Messe Frankfurt GmbH",
        scale: "GLOBAL_MEGA",
        format: "IN_PERSON",
        estimatedPrice: 85,
        currency: "EUR",
      },
    ],
  },
  "excel-london": {
    venueName: "ExCeL London",
    regionCode: "global",
    feed: [
      {
        rawTitle: "London International Developer & Cloud Congress 2026",
        venueSlug: "excel-london",
        dateString: "2026-10-14 to 2026-10-16",
        hallNames: ["ICC Capital Hall", "Platinum Suite 1"],
        category: "TECH_DEV_SUMMIT",
        description: "European developer summit focusing on distributed systems, AI inference architectures, and DevOps.",
        organizerName: "Cloud Native Computing Foundation",
        scale: "LARGE",
        format: "HYBRID",
        estimatedPrice: 350,
        currency: "GBP",
      },
    ],
  },
  "mccormick-place": {
    venueName: "McCormick Place",
    regionCode: "global",
    feed: [
      {
        rawTitle: "International Manufacturing Technology Show (IMTS) 2026",
        venueSlug: "mccormick-place",
        dateString: "2026-09-14 to 2026-09-19",
        hallNames: ["North Building - Hall B1", "South Building - Hall A"],
        category: "INDUSTRIAL_B2B",
        description: "North America's largest manufacturing machinery, CNC tooling, and robotics exhibition.",
        organizerName: "Association for Manufacturing Technology",
        scale: "GLOBAL_MEGA",
        format: "IN_PERSON",
        estimatedPrice: 150,
        currency: "USD",
      },
    ],
  },
};

// ============================================================================
// BATCH CRAWLER PIPELINE ENGINE
// ============================================================================

/**
 * Executes a full or selective crawl batch across configured MICE venues.
 */
export async function runVenueCrawlerBatch(options: CrawlBatchOptions = {}): Promise<CrawlRunRecord> {
  const startTime = Date.now();
  const runId = `CRAWL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const errors: string[] = [];
  const targetVenues = options.venueSlugs && options.venueSlugs.length > 0
    ? options.venueSlugs
    : Object.keys(VENUE_SCRAPER_SOURCES);

  // 1. Gather all raw scraped events from selected venues
  const rawEvents: ScrapedEventRaw[] = [];
  for (const slug of targetVenues) {
    const source = VENUE_SCRAPER_SOURCES[slug];
    if (source) {
      rawEvents.push(...source.feed);
    } else {
      errors.push(`Venue feed not found for slug: ${slug}`);
    }
  }

  // 2. Normalize raw events
  const normalizedEvents = rawEvents.map(normalizeScrapedEvent);

  // 3. Collect existing event fingerprints from Database
  const existingFingerprints = new Set<string>();
  try {
    const dbEvents = await db.event.findMany({
      select: { slug: true, title: true, startDate: true, venue: { select: { slug: true } } },
    });
    for (const evt of dbEvents) {
      const fp = computeEventFingerprint(evt.venue?.slug || "venue", evt.title, evt.startDate);
      existingFingerprints.add(fp);
    }
  } catch (err) {
    // If DB offline or not configured in unit test, proceed with empty set
    errors.push(`Fingerprint query fallback: ${(err as Error).message}`);
  }

  // 4. Deduplicate batch
  const dedup = deduplicateEvents(existingFingerprints, normalizedEvents);

  const eventRecords: CrawlRunRecord["events"] = [];

  // 5. Persist to Database if requested and not dryRun
  if (options.persistToDb && !options.dryRun) {
    for (const item of dedup.toInsert) {
      try {
        // Resolve venue in database
        let venue = await db.venue.findUnique({ where: { slug: item.venueSlug } });
        if (!venue) {
          // Resolve region
          const regionCode = item.venueSlug.includes("tokyo") ? "jp" : item.venueSlug.includes("ice") || item.venueSlug.includes("jiexpo") ? "id" : "global";
          venue = await db.venue.create({
            data: {
              name: VENUE_SCRAPER_SOURCES[item.venueSlug]?.venueName || item.venueSlug,
              slug: item.venueSlug,
              city: regionCode === "id" ? "Jakarta" : regionCode === "jp" ? "Tokyo" : "International",
              address: `Convention Boulevard, ${item.venueSlug}`,
              regionId: regionCode,
              transitInfo: "Direct rail / airport transit terminal access.",
            },
          });
        }

        // Resolve or create organizer user
        let organizer = await db.user.findFirst({ where: { role: "ORGANIZER" } });
        if (!organizer) {
          organizer = await db.user.create({
            data: {
              name: item.organizerName,
              email: `crawler-${item.slug.slice(0, 15)}@xpo-events.org`,
              role: "ORGANIZER",
              organization: item.organizerName,
            },
          });
        }

        // Create Event in database
        const createdEvent = await db.event.create({
          data: {
            title: item.title,
            slug: `${item.slug}-${Date.now().toString().slice(-4)}`,
            description: item.description,
            archetype: item.archetype,
            startDate: item.startDate,
            endDate: item.endDate,
            scale: item.scale,
            format: item.format,
            heroImageUrl: item.heroImageUrl,
            regionId: venue.regionId,
            venueId: venue.id,
            organizerId: organizer.id,
            ticketTiers: {
              create: [
                {
                  name: "Standard Delegate Pass",
                  price: item.estimatedPrice,
                  currency: item.currency,
                  capacity: 1000,
                  benefitsJson: JSON.stringify(["Access to all exhibition halls", "Official event guide", "Digital badge"]),
                },
                {
                  name: "VIP Buyer & Executive Pass",
                  price: item.estimatedPrice * 2.5,
                  currency: item.currency,
                  capacity: 200,
                  benefitsJson: JSON.stringify(["VIP Lounge Access", "Fast-Track Door Entry", "Bilateral Deal-Room Booking", "Barista Coffee"]),
                },
              ],
            },
          },
        });

        eventRecords.push({
          title: item.title,
          venueSlug: item.venueSlug,
          action: "INSERTED",
          fingerprint: item.fingerprint,
        });
      } catch (insertErr) {
        errors.push(`Failed to persist event '${item.title}': ${(insertErr as Error).message}`);
      }
    }
  } else {
    // Dry run simulation
    for (const item of dedup.toInsert) {
      eventRecords.push({
        title: item.title,
        venueSlug: item.venueSlug,
        action: "INSERTED",
        fingerprint: item.fingerprint,
      });
    }
  }

  for (const item of dedup.toSkip) {
    eventRecords.push({
      title: item.title,
      venueSlug: item.venueSlug,
      action: "SKIPPED_DUPLICATE",
      fingerprint: item.fingerprint,
    });
  }

  const durationMs = Date.now() - startTime;
  const runRecord: CrawlRunRecord = {
    runId,
    timestamp: new Date().toISOString(),
    venueSlugsScraped: targetVenues,
    totalScraped: normalizedEvents.length,
    insertedCount: dedup.stats.newCount,
    skippedDuplicatesCount: dedup.stats.duplicateCount,
    durationMs,
    status: errors.length > 0 && dedup.stats.newCount === 0 ? "FAILED" : errors.length > 0 ? "PARTIAL" : "COMPLETED",
    errors,
    events: eventRecords,
  };

  // Record in memory history
  CRAWL_HISTORY_REGISTRY.unshift(runRecord);
  if (CRAWL_HISTORY_REGISTRY.length > 50) {
    CRAWL_HISTORY_REGISTRY.pop();
  }

  return runRecord;
}

/**
 * Retrieves the crawl execution history.
 */
export function getCrawlHistory(): CrawlRunRecord[] {
  return [...CRAWL_HISTORY_REGISTRY];
}

/**
 * Clears crawl run history (for test isolation).
 */
export function clearCrawlHistory(): void {
  CRAWL_HISTORY_REGISTRY.length = 0;
}
