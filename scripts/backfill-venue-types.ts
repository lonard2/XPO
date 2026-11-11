/**
 * Backfill venue types and space kinds for the known seed inventory.
 *
 * Additive and idempotent. Run with `--dry-run` first. An operator-set type
 * is never overwritten unless `--force` is passed. Meeting rooms are never
 * reclassified.
 *
 *   npx tsx scripts/backfill-venue-types.ts --dry-run
 *   npx tsx scripts/backfill-venue-types.ts
 */
import { db } from "../src/lib/db";
import {
  isSpaceKind,
  shouldUpdateVenueType,
  type SpaceKind,
  type VenueType,
} from "../src/lib/discovery/venueTypes";

const VENUE_TYPE_BY_SLUG: Record<string, VenueType> = {
  "jiexpo-kemayoran": "EXHIBITION_CENTER",
  "ice-bsd-city": "EXHIBITION_CENTER",
  "jcc-senayan": "CONVENTION_CENTER",
  "nice-pik-2": "CONVENTION_CENTER",
  "gbk-sports-complex": "STADIUM",
  "jis-jakarta": "STADIUM",
  "tokyo-big-sight": "EXHIBITION_CENTER",
  "makuhari-messe": "EXHIBITION_CENTER",
  "pacifico-yokohama": "CONVENTION_CENTER",
  "marina-bay-sands-expo": "EXHIBITION_CENTER",
  "messe-frankfurt": "EXHIBITION_CENTER",
  "excel-london": "EXHIBITION_CENTER",
  "grand-indonesia-atrium": "MALL",
  "yoyogi-park-events-ground": "OUTDOOR",
  "battersea-riverside-plaza": "OUTDOOR",
};

const SPACE_KIND_BY_SLUG: Record<string, Record<string, SpaceKind>> = {
  "grand-indonesia-atrium": {
    "Atrium Level 3A": "ATRIUM",
  },
  "yoyogi-park-events-ground": {
    "Keyaki Plaza Lawn": "FIELD",
  },
  "battersea-riverside-plaza": {
    "Riverside Event Deck": "OUTDOOR",
  },
  "gbk-sports-complex": {
    "Stadion Utama GBK": "ARENA",
    "Indonesia Arena": "ARENA",
    "Istora Senayan": "ARENA",
    "Stadion Madya": "ARENA",
    "Aquatic Stadium": "ARENA",
    "Tennis Indoor Stadium": "ARENA",
    "Tennis Outdoor Center Court": "COURT",
    "Basketball Hall": "COURT",
    "Baseball Field": "FIELD",
    "Softball Field": "FIELD",
    "Hockey Field": "FIELD",
    "Archery Field": "FIELD",
    "Squash Stadium": "COURT",
    "Plazas and Festival Grounds": "OUTDOOR",
    "Gedung Serbaguna": "HALL",
    "GBK Arena": "ARENA",
  },
  "jis-jakarta": {
    "Main Stadium Bowl": "ARENA",
    "Sky View Deck": "OUTDOOR",
    "Training Fields": "FIELD",
    "VIP Tribune": "ARENA",
    "Outdoor Plaza and Pedestrian Ramp": "OUTDOOR",
  },
};

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const prefix = dryRun ? "[dry-run]" : "[update]";

async function main() {
  let venueUpdates = 0;
  let spaceUpdates = 0;
  let skipped = 0;

  for (const [slug, targetType] of Object.entries(VENUE_TYPE_BY_SLUG)) {
    const venue = await db.venue.findUnique({
      where: { slug },
      include: { halls: true },
    });
    if (!venue) {
      console.log(`${prefix} missing venue ${slug}, skipped`);
      continue;
    }

    if (venue.type !== targetType) {
      if (!shouldUpdateVenueType(venue.type, targetType, venue.typeSource, force)) {
        console.log(
          `${prefix} ${slug}: type already ${venue.type} (${venue.typeSource}), kept (use --force to change)`
        );
        skipped += 1;
      } else {
        console.log(`${prefix} ${slug}: type ${venue.type} -> ${targetType}`);
        if (!dryRun) {
          await db.venue.update({
            where: { id: venue.id },
            data: { type: targetType },
          });
        }
        venueUpdates += 1;
      }
    }

    const kindMap = SPACE_KIND_BY_SLUG[slug];
    if (!kindMap) continue;

    for (const hall of venue.halls) {
      const targetKind = kindMap[hall.name];
      if (!targetKind || !isSpaceKind(targetKind)) continue;
      if (hall.kind === targetKind) continue;
      if (hall.kind === "MEETING_ROOM") {
        console.log(`${prefix} ${slug} / ${hall.name}: meeting room kept`);
        continue;
      }
      if (hall.kind !== "HALL" && !force) {
        console.log(
          `${prefix} ${slug} / ${hall.name}: kind already ${hall.kind}, kept (use --force to change)`
        );
        skipped += 1;
        continue;
      }
      console.log(
        `${prefix} ${slug} / ${hall.name}: kind ${hall.kind} -> ${targetKind}`
      );
      if (!dryRun) {
        await db.venueHall.update({
          where: { id: hall.id },
          data: { kind: targetKind },
        });
      }
      spaceUpdates += 1;
    }
  }

  console.log(
    `${dryRun ? "Planned" : "Applied"} ${venueUpdates} venue type(s) and ${spaceUpdates} space kind(s); ${skipped} kept.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
