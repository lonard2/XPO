import { describe, it, expect } from "vitest";
import { normalizeInterests, scoreEventsByInterests } from "@/lib/matching/suggest";

describe("interest matching", () => {
  it("keeps only known archetype ids, deduplicated", () => {
    expect(
      normalizeInterests(["TECH_DEV_SUMMIT", "NOPE", "TECH_DEV_SUMMIT", 42, null])
    ).toEqual(["TECH_DEV_SUMMIT"]);
    expect(normalizeInterests("TECH_DEV_SUMMIT")).toEqual([]);
    expect(normalizeInterests(undefined)).toEqual([]);
  });

  it("scores a direct archetype hit above a same-cluster hit", () => {
    const events = [
      { id: "tech", archetype: "TECH_DEV_SUMMIT" },
      // MEDIA_BROADCAST shares the digital_tech_media cluster with TECH_DEV_SUMMIT.
      { id: "media", archetype: "MEDIA_BROADCAST" },
      { id: "unrelated", archetype: "AGRITECH_FOOD" },
    ];
    const scored = scoreEventsByInterests(events, ["TECH_DEV_SUMMIT"]);
    expect(scored.map((s) => s.event.id)).toEqual(["tech", "media"]);
    expect(scored[0].score).toBe(2);
    expect(scored[1].score).toBe(1);
    expect(scored[0].matchedInterests).toEqual(["TECH_DEV_SUMMIT"]);
    expect(scored[1].matchedInterests).toEqual(["TECH_DEV_SUMMIT"]);
  });

  it("returns nothing without interests or without matches", () => {
    const events = [{ id: "a", archetype: "TECH_DEV_SUMMIT" }];
    expect(scoreEventsByInterests(events, [])).toEqual([]);
    expect(scoreEventsByInterests(events, ["AGRITECH_FOOD"])).toEqual([]);
    expect(scoreEventsByInterests([], ["TECH_DEV_SUMMIT"])).toEqual([]);
  });
});
