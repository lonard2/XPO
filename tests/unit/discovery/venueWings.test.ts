import { describe, it, expect } from "vitest";
import { VENUE_WINGS, assignWing, matchingWingCount } from "@/lib/discovery/venueWings";
import { FALLBACK_VENUES } from "@/lib/discovery/fallbackData";

/**
 * Every inventoried hall must land in exactly one wing of its venue. This locks the
 * per-venue vocabularies: adding or renaming a hall without updating its venue's rules
 * fails here instead of silently dropping the hall into a generic bucket.
 */
describe("Venue wing coverage", () => {
  it("covers all twelve venues with rules", () => {
    expect(Object.keys(VENUE_WINGS).sort()).toEqual(
      FALLBACK_VENUES.map((v) => v.slug).sort()
    );
  });

  it("assigns every hall to exactly one wing", () => {
    const problems: string[] = [];

    for (const venue of FALLBACK_VENUES) {
      for (const hall of venue.halls || []) {
        const count = matchingWingCount(venue.slug, hall.name);
        if (count !== 1) {
          problems.push(`${venue.slug} / ${hall.name} matches ${count} wings`);
        }
        if (assignWing(venue.slug, hall.name) === null) {
          problems.push(`${venue.slug} / ${hall.name} unassigned`);
        }
      }
    }

    expect(problems).toEqual([]);
  });

  it("uses each venue's real vocabulary", () => {
    expect(assignWing("tokyo-big-sight", "East Exhibition Hall 7")).toBe("east");
    expect(assignWing("tokyo-big-sight", "South Exhibition Hall 2")).toBe("south");
    expect(assignWing("tokyo-big-sight", "Ariake GYM-EX Exhibition Hall")).toBe("satellite");
    expect(assignWing("nice-pik-2", "Exhibition Hall 10")).toBe("building-c");
    expect(assignWing("nice-pik-2", "Exhibition Hall 2")).toBe("building-a");
    expect(assignWing("makuhari-messe", "Exhibition Hall 10")).toBe("halls-9-11");
    expect(assignWing("makuhari-messe", "Exhibition Hall 1")).toBe("halls-1-8");
    expect(assignWing("pacifico-yokohama", "National Convention Hall of Yokohama")).toBe("national");
    expect(assignWing("pacifico-yokohama", "North G3")).toBe("north");
    expect(assignWing("gbk-sports-complex", "Istora Senayan")).toBe("arenas");
    expect(assignWing("jiexpo-kemayoran", "Hall D1")).toBe("east");
    expect(assignWing("messe-frankfurt", "Festhalle")).toBe("festhalle");
    expect(assignWing("excel-london", "Immerse LDN")).toBe("leisure");
  });

  it("falls back gracefully for unknown venues", () => {
    expect(assignWing("unknown-venue", "East Hall 1")).toBe("east");
    expect(assignWing(undefined, "Plenary Hall")).toBe("convention");
  });
});
