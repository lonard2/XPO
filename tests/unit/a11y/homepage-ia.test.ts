import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const HOME_PAGE = path.resolve(
  __dirname,
  "../../../src/app/[locale]/(attendee)/page.tsx"
);
const VENUES = path.resolve(
  __dirname,
  "../../../src/components/discovery/MajorVenuesUpcomingSection.tsx"
);

describe("Quality Gate: homepage closing action", () => {
  const page = fs.readFileSync(HOME_PAGE, "utf8");

  it("ends on an attendee pass action, not settings", () => {
    const start = page.lastIndexOf("conciergeBannerTitle");
    expect(start).toBeGreaterThan(-1);
    const tail = page.slice(start);
    expect(tail).toContain("/events");
    expect(tail).not.toContain("/settings");
  });

  it("de-duplicates the hero lead from the featured row", () => {
    expect(page).toContain("withoutHeroLead");
    expect(page).toContain("featuredRowEvents");
  });

  it("wraps the venue section exactly once", () => {
    expect(page).not.toMatch(
      /<section className="container">\s*<MajorVenuesUpcomingSection/
    );
    expect(page).toContain('<MajorVenuesUpcomingSection');
  });

  it("keeps the featured CTA clear of the floating concierge on phones", () => {
    const lines = page.split("\n");
    const idx = lines.findIndex((line) => line.includes("viewFullSchedule"));
    expect(idx).toBeGreaterThan(-1);
    const block = lines.slice(Math.max(0, idx - 4), idx + 4).join("\n");
    expect(block).toContain("self-start");
  });

  it("keeps main event rows on the normal grid card", () => {
    expect(page).not.toContain("featuredRowEvents.length <= 2 ? 'horizontal' : 'grid'");
    expect(page).not.toContain("row.items.length <= 2 ? 'horizontal' : 'grid'");
    expect(page).toContain('singleClassName="max-w-sm"');
  });

  it("does not cap the venue directory at six", () => {
    const idx = page.indexOf("db.venue.findMany");
    expect(idx).toBeGreaterThan(-1);
    const block = page.slice(idx, idx + 900);
    expect(block).not.toContain("take: 6");
  });

  it("links the concluded archive to the supported date filter", () => {
    expect(page).toContain("dateRange=concluded");
  });

  it("uses a view-venue label, not a calendar label that opens a venue", () => {
    const venues = fs.readFileSync(VENUES, "utf8");
    expect(venues).toContain("viewVenue");
    expect(venues).not.toContain("exploreFullCalendar");
  });

  it("uses a translation key for the venue directory CTA", () => {
    const venues = fs.readFileSync(VENUES, "utf8");
    expect(venues).toContain("viewAllVenues");
    expect(venues).not.toContain(".split('&')");
  });
});
