import { describe, it, expect } from "vitest";
import { matchesDateRange } from "@/lib/discovery/dateFilters";

const now = new Date("2026-11-10T12:00:00Z"); // Tuesday

const ev = (start: string, end: string) => ({
  startDate: new Date(start),
  endDate: new Date(end),
});

describe("matchesDateRange", () => {
  const past = ev("2026-10-01T09:00:00Z", "2026-10-03T18:00:00Z");
  const ongoing = ev("2026-11-09T09:00:00Z", "2026-11-12T18:00:00Z");
  const soon = ev("2026-11-14T09:00:00Z", "2026-11-16T18:00:00Z");
  const far = ev("2027-03-01T09:00:00Z", "2027-03-03T18:00:00Z");

  it("all keeps everything, including concluded", () => {
    for (const event of [past, ongoing, soon, far]) {
      expect(matchesDateRange(event, "all", now)).toBe(true);
    }
  });

  it("splits upcoming, ongoing, and concluded", () => {
    expect(matchesDateRange(past, "upcoming", now)).toBe(false);
    expect(matchesDateRange(ongoing, "upcoming", now)).toBe(false);
    expect(matchesDateRange(soon, "upcoming", now)).toBe(true);

    expect(matchesDateRange(ongoing, "ongoing", now)).toBe(true);
    expect(matchesDateRange(soon, "ongoing", now)).toBe(false);

    expect(matchesDateRange(past, "concluded", now)).toBe(true);
    expect(matchesDateRange(ongoing, "concluded", now)).toBe(false);
  });

  it("matches windows by overlap, not only by start date", () => {
    // Ongoing event started before the 7-day window but runs into it.
    const straddling = ev("2026-11-08T09:00:00Z", "2026-11-12T18:00:00Z");
    const inNinety = ev("2027-01-20T09:00:00Z", "2027-01-21T18:00:00Z");
    expect(matchesDateRange(straddling, "next_7_days", now)).toBe(true);
    expect(matchesDateRange(soon, "next_7_days", now)).toBe(true);
    expect(matchesDateRange(far, "next_7_days", now)).toBe(false);
    expect(matchesDateRange(inNinety, "next_90_days", now)).toBe(true);
    expect(matchesDateRange(far, "next_90_days", now)).toBe(false);
  });

  it("uses calendar windows for week, month, and year", () => {
    const thisMonth = ev("2026-11-20T09:00:00Z", "2026-11-21T18:00:00Z");
    const nextMonth = ev("2026-12-05T09:00:00Z", "2026-12-06T18:00:00Z");
    expect(matchesDateRange(thisMonth, "this_month", now)).toBe(true);
    expect(matchesDateRange(nextMonth, "this_month", now)).toBe(false);
    expect(matchesDateRange(nextMonth, "next_month", now)).toBe(true);
    expect(matchesDateRange(far, "this_year", now)).toBe(false);
    expect(matchesDateRange(thisMonth, "this_year", now)).toBe(true);
  });

  it("ignores unknown ranges instead of hiding everything", () => {
    expect(matchesDateRange(past, "past_century", now)).toBe(true);
  });
});
