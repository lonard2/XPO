import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const HOME_PAGE = path.resolve(__dirname, "../../../src/app/[locale]/(attendee)/page.tsx");
const IDENTITY_STRIP = path.resolve(
  __dirname,
  "../../../src/components/discovery/IdentityStrip.tsx"
);

/**
 * Structural guard for the attendee homepage heading.
 *
 * The page once shipped with no `h1` at all: every heading was an `h2`. A later fix
 * added a visually hidden `h1`, which satisfied the outline but left the first screen
 * saying nothing about the platform. The heading now lives in the identity plate, is
 * visible, and names the page rather than whichever carousel slide is on screen.
 */
describe("Quality Gate: Homepage heading structure", () => {
  const page = fs.readFileSync(HOME_PAGE, "utf8");
  const strip = fs.readFileSync(IDENTITY_STRIP, "utf8");

  it("renders exactly one page-level h1, owned by the identity plate", () => {
    expect(page.match(/<h1[\s>]/g) ?? []).toHaveLength(0);
    expect(strip.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it("keeps the h1 in the visual flow instead of hiding it", () => {
    const openingTag = strip.match(/<h1[^>]*>/)?.[0] ?? "";
    expect(openingTag).not.toContain("sr-only");
    expect(openingTag).toContain("text-");
  });

  it("sources the heading and subtitle from the message bundles", () => {
    expect(page).toMatch(/title=\{tHero\(['"]title['"]\)\}/);
    expect(page).toMatch(/highlight=\{tHero\(['"]titleHighlight['"]\)\}/);
    expect(page).toMatch(/subtitle=\{tHero\(['"]subtitle['"]\)\}/);
    expect(strip).not.toMatch(/>[A-Za-z]{4,}</);
  });
});
