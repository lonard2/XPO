import { describe, it, expect } from "vitest";
import {
  RAIL_SIZE,
  railCandidates,
  pickRailRegion,
  rankRailEvents,
  mergeRows,
  resolveRowCopy,
  withoutHeroLead,
} from "@/lib/homepage/rows";

const event = (
  id: string,
  overrides: Partial<{
    isFeatured: boolean;
    startDate: string;
    bookingCount: number;
  }> = {}
) => ({
  id,
  isFeatured: overrides.isFeatured ?? true,
  startDate: overrides.startDate ?? "2026-12-01T09:00:00Z",
  bookingCount: overrides.bookingCount ?? 0,
});

describe("Homepage row resolvers", () => {
  it("offers every other region and never the active one", () => {
    expect(railCandidates("id")).toEqual(["jp", "global"]);
    expect(railCandidates("jp")).toEqual(["id", "global"]);
    expect(railCandidates("global")).toEqual(["id", "jp"]);
    for (const active of ["id", "jp", "global"]) {
      expect(railCandidates(active)).not.toContain(active);
    }
  });

  it("rotates the rail region daily and never picks the active region", () => {
    const morning = new Date("2026-11-10T01:00:00Z");
    const evening = new Date("2026-11-10T23:00:00Z");
    expect(pickRailRegion("id", morning)).toBe(pickRailRegion("id", evening));

    const picks = new Set<string>();
    for (let day = 0; day < 14; day += 1) {
      const date = new Date(Date.UTC(2026, 10, 1 + day));
      const pick = pickRailRegion("id", date);
      expect(pick).not.toBe("id");
      picks.add(pick);
    }
    expect(picks.size).toBeGreaterThan(1);
  });

  it("ranks featured events by bookings before lower-volume ones", () => {
    const ranked = rankRailEvents([
      event("low", { bookingCount: 2 }),
      event("high", { bookingCount: 9 }),
    ]);
    expect(ranked.map((e) => e.id)).toEqual(["high", "low"]);
  });

  it("fills to three with non-featured events when featured inventory is thin", () => {
    const ranked = rankRailEvents([
      event("featured", { bookingCount: 1 }),
      event("plain-a", { isFeatured: false, bookingCount: 5 }),
      event("plain-b", { isFeatured: false, bookingCount: 3 }),
      event("plain-c", { isFeatured: false, bookingCount: 0 }),
    ]);
    expect(ranked).toHaveLength(RAIL_SIZE);
    expect(ranked[0].id).toBe("featured");
    expect(ranked.map((e) => e.id)).toEqual(["featured", "plain-a", "plain-b"]);
  });

  it("breaks booking ties by start date", () => {
    const ranked = rankRailEvents([
      event("later", { bookingCount: 4, startDate: "2026-12-20T09:00:00Z" }),
      event("sooner", { bookingCount: 4, startDate: "2026-12-05T09:00:00Z" }),
    ]);
    expect(ranked.map((e) => e.id)).toEqual(["sooner", "later"]);
  });

  it("merges region and all-edition rows by position, region first on ties", () => {
    const merged = mergeRows(
      [
        { id: "region-2", regionId: "id", position: 1 },
        { id: "region-0", regionId: "id", position: 0 },
      ],
      [
        { id: "all-1", regionId: null, position: 1 },
        { id: "all-0", regionId: null, position: 0 },
      ]
    );
    expect(merged.map((r) => r.id)).toEqual([
      "region-0",
      "all-0",
      "region-2",
      "all-1",
    ]);
  });

  it("drops the hero lead from the featured row when other events remain", () => {
    const events = [{ id: "lead" }, { id: "second" }, { id: "third" }];
    expect(withoutHeroLead(events, "lead").map((e) => e.id)).toEqual([
      "second",
      "third",
    ]);
  });

  it("keeps the hero lead when it is the only attendable event", () => {
    expect(withoutHeroLead([{ id: "lead" }], "lead").map((e) => e.id)).toEqual([
      "lead",
    ]);
  });

  it("matches a fallback lead by slug when the ids differ", () => {
    const events = [
      { id: "event-1", slug: "fashion" },
      { id: "event-2", slug: "sports" },
    ];
    expect(
      withoutHeroLead(events, "slide-id-1", "fashion").map((e) => e.id)
    ).toEqual(["event-2"]);
  });

  it("keeps every event when no hero lead is known", () => {
    const events = [{ id: "a" }, { id: "b" }];
    expect(withoutHeroLead(events, undefined)).toEqual(events);
  });

  it("resolves row copy by exact locale with a default fallback", () => {
    const row = {
      title: "Energy transition week",
      titleI18n: { id: "Pekan transisi energi" },
      subtitle: "Grids, storage, and the people building them",
      subtitleI18n: { id: "   " },
    };
    expect(resolveRowCopy(row, "id")).toEqual({
      title: "Pekan transisi energi",
      subtitle: "Grids, storage, and the people building them",
    });
    expect(resolveRowCopy(row, "de")).toEqual({
      title: "Energy transition week",
      subtitle: "Grids, storage, and the people building them",
    });
  });
});
