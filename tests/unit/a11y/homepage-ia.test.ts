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

  it("uses a translation key for the venue directory CTA", () => {
    const venues = fs.readFileSync(VENUES, "utf8");
    expect(venues).toContain("viewAllVenues");
    expect(venues).not.toContain(".split('&')");
  });
});
