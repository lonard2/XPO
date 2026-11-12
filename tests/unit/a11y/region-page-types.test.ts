import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const REGION_PAGE = path.resolve(
  __dirname,
  "../../../src/app/[locale]/(attendee)/region/[code]/page.tsx"
);

describe("Quality Gate: region edition venue labels", () => {
  it("uses the type-aware count and metric instead of the hall-only count", () => {
    const src = fs.readFileSync(REGION_PAGE, "utf8");
    expect(src).toContain("countSpaces");
    expect(src).toContain("metricLabelKey");
    expect(src).not.toContain("countHalls");
  });

  it("passes the active locale to every server translation", () => {
    const src = fs.readFileSync(REGION_PAGE, "utf8");
    expect(src).toContain('getTranslations({ locale, namespace: "regions" })');
    expect(src).toContain('getTranslations({ locale, namespace: "venues" })');
    expect(src).toContain('getTranslations({ locale, namespace: "common" })');
  });
});
