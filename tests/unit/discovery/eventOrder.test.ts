import { describe, it, expect } from "vitest";
import { sortUpcomingFirst } from "@/lib/discovery/eventOrder";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function event(id: string, startDate: string, endDate: string) {
  return { id, startDate, endDate };
}

describe("sortUpcomingFirst", () => {
  it("puts upcoming events ahead of concluded ones", () => {
    // Regression: ascending start date opened the hero on a finished fair.
    const concluded = event("fair", "2026-06-10", "2026-06-13");
    const upcoming = event("summit", "2026-09-14", "2026-09-18");

    const sorted = sortUpcomingFirst([concluded, upcoming], NOW);

    expect(sorted.map((e) => e.id)).toEqual(["summit", "fair"]);
  });

  it("orders upcoming events soonest first", () => {
    const far = event("far", "2026-12-01", "2026-12-03");
    const near = event("near", "2026-07-01", "2026-07-02");

    expect(sortUpcomingFirst([far, near], NOW).map((e) => e.id)).toEqual(["near", "far"]);
  });

  it("orders concluded events most recently concluded first", () => {
    const old = event("old", "2026-01-05", "2026-01-07");
    const recent = event("recent", "2026-06-10", "2026-06-13");

    expect(sortUpcomingFirst([old, recent], NOW).map((e) => e.id)).toEqual(["recent", "old"]);
  });

  it("treats a currently running event as attendable and puts it first", () => {
    const live = event("live", "2026-06-14", "2026-06-16");
    const upcoming = event("upcoming", "2026-07-01", "2026-07-02");
    const concluded = event("concluded", "2026-05-01", "2026-05-02");

    expect(sortUpcomingFirst([concluded, upcoming, live], NOW).map((e) => e.id)).toEqual([
      "live",
      "upcoming",
      "concluded",
    ]);
  });

  it("treats an event ending exactly now as attendable", () => {
    const ending = event("ending", "2026-06-13", NOW.toISOString());

    expect(sortUpcomingFirst([ending], NOW)[0].id).toBe("ending");
  });

  it("is stable for events that compare equal", () => {
    const a = event("a", "2026-07-01", "2026-07-02");
    const b = event("b", "2026-07-01", "2026-07-02");
    const c = event("c", "2026-07-01", "2026-07-02");

    expect(sortUpcomingFirst([a, b, c], NOW).map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input array", () => {
    const input = [event("later", "2026-09-01", "2026-09-02"), event("sooner", "2026-07-01", "2026-07-02")];

    sortUpcomingFirst(input, NOW);

    expect(input.map((e) => e.id)).toEqual(["later", "sooner"]);
  });

  it("accepts Date objects as well as strings", () => {
    const concluded = event("concluded", "2026-01-01", "2026-01-02");
    const upcoming = {
      id: "date-object",
      startDate: new Date("2026-08-01T00:00:00.000Z"),
      endDate: new Date("2026-08-02T00:00:00.000Z"),
    };

    expect(sortUpcomingFirst([concluded, upcoming], NOW).map((e) => e.id)).toEqual([
      "date-object",
      "concluded",
    ]);
  });

  it("handles an empty list", () => {
    expect(sortUpcomingFirst([], NOW)).toEqual([]);
  });

  it("does not throw on an unparseable date and sorts it last", () => {
    const broken = event("broken", "not-a-date", "also-not-a-date");
    const concluded = event("concluded", "2026-01-01", "2026-01-02");

    expect(() => sortUpcomingFirst([broken, concluded], NOW)).not.toThrow();
    expect(sortUpcomingFirst([broken, concluded], NOW).map((e) => e.id)).toEqual([
      "concluded",
      "broken",
    ]);
  });
});
