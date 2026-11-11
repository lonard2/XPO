import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const VENUE_PAGE = path.resolve(
  __dirname,
  "../../../src/app/[locale]/(attendee)/venues/[slug]/page.tsx"
);
const ADMIN_MANAGER = path.resolve(
  __dirname,
  "../../../src/components/admin/VenueDirectoryManagerClient.tsx"
);

describe("Quality Gate: venue page and admin type wiring", () => {
  it("uses the type-aware metric and never fabricates a count of four", () => {
    const src = fs.readFileSync(VENUE_PAGE, "utf8");
    expect(src).toContain("metricLabelKey");
    expect(src).toContain("countSpaces");
    expect(src).not.toContain("spaceCount || 4");
  });

  it("localizes the admin type fields and normalizes an unknown kind", () => {
    const src = fs.readFileSync(ADMIN_MANAGER, "utf8");
    expect(src).toContain("venueTypeField");
    expect(src).toContain("venueCapacityField");
    expect(src).toContain("normalizeSpaceKind(h.kind)");
  });
});
