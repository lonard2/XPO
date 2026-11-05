import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const VENUES = path.resolve(__dirname, "../../../src/components/discovery/MajorVenuesUpcomingSection.tsx");
const PILLS = path.resolve(__dirname, "../../../src/components/discovery/EventCategoryPills.tsx");
const CALENDAR = path.resolve(__dirname, "../../../src/components/discovery/EventCalendarWidget.tsx");
const HOME_PAGE = path.resolve(__dirname, "../../../src/app/[locale]/(attendee)/page.tsx");
const FALLBACK_DATA = path.resolve(__dirname, "../../../src/lib/discovery/fallbackData.ts");

/**
 * Structural guard for homepage Expressive motion, part two.
 *
 * Cards and grids got their hooks in the first pass. Three interactive
 * surfaces were left static: the major-venue grid (tilt on cards, but the
 * grid mounts all at once and banners have no sheen), the 22 category
 * tiles (good hovers, no press physics), and the calendar day-list (new
 * content on every date tap with no entrance).
 *
 * Deliberately NOT wired: the IdentityStrip masthead (first-paint signage,
 * decorated by mandate in neither motion mode), the calendar day cells
 * (functional density targets), and the routing strips (quiet utility).
 */
describe("Quality Gate: Homepage expressive wiring, part two", () => {
  const venues = fs.readFileSync(VENUES, "utf8");
  const pills = fs.readFileSync(PILLS, "utf8");
  const calendar = fs.readFileSync(CALENDAR, "utf8");

  const lineWith = (src: string, needle: string) =>
    src.split("\n").find((line) => line.includes(needle)) ?? "";

  it("cascades the major-venue grid entrance", () => {
    expect(lineWith(venues, "venueGridClass(orderedVenues.length)")).toContain("stagger-children");
  });

  it("sweeps the venue banner imagery on hover", () => {
    expect(lineWith(venues, "relative h-36 sm:h-44")).toContain("sheen");
  });

  it("gives category tiles press physics in every motion mode", () => {
    expect(lineWith(pills, "min-h-[125px]")).toContain("card-interactive-3d");
  });

  it("re-cascades the calendar day-list on every date tap", () => {
    const lines = calendar.split("\n");
    const idx = lines.findIndex((line) => line.includes("space-y-2.5 max-h-[260px]"));
    expect(idx).toBeGreaterThan(-1);
    const block = lines.slice(Math.max(0, idx - 3), idx + 1).join("\n");
    expect(block).toContain("stagger-children");
    expect(block).toMatch(/key=\{[^;]*selectedDate/);
  });
});

describe("Quality Gate: Editorial blurb banner wiring", () => {
  const page = fs.readFileSync(HOME_PAGE, "utf8");
  const fallback = fs.readFileSync(FALLBACK_DATA, "utf8");

  it("resolves the blurb beside the tagline in the banner mapping", () => {
    const lines = page.split("\n");
    const idx = lines.findIndex((line) => line.includes("tagline: evt.tagline"));
    expect(idx).toBeGreaterThan(-1);
    const block = lines.slice(idx, idx + 5).join("\n");
    expect(block).toContain("resolveEditorialBlurb");
  });

  it("ships editorial examples in the fallback slides", () => {
    expect(fallback).toContain("editorialBlurb");
  });
});
