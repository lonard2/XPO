import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const WIZARD = path.resolve(
  __dirname,
  "../../../src/app/[locale]/(organizer)/events/new/page.tsx"
);
const VENUES_API = path.resolve(
  __dirname,
  "../../../src/app/api/organizer/venues/route.ts"
);

describe("Quality Gate: event wizard venue types", () => {
  it("shows the venue type and space kind in the selectors", () => {
    const wizard = fs.readFileSync(WIZARD, "utf8");
    expect(wizard).toContain("normalizeVenueType");
    expect(wizard).toContain("normalizeSpaceKind");
    expect(wizard).toContain("tVenueType");
    expect(wizard).toContain("tSpaceKind");
    expect(wizard).toContain("wizardSelectSpace");
  });

  it("returns the venue type to the wizard", () => {
    const api = fs.readFileSync(VENUES_API, "utf8");
    expect(api).toContain("type: true");
  });
});
