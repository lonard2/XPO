import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const HOME_PAGE = path.resolve(__dirname, "../../../src/app/[locale]/(attendee)/page.tsx");

/**
 * Structural guard for the attendee homepage heading.
 *
 * The page previously shipped with no `h1` at all: every heading was an `h2`, so the
 * document had no top-level heading for search engines or screen-reader outline
 * navigation. The hero rotates between events, so the `h1` names the page itself and is
 * visually hidden rather than tracking whichever slide is on screen.
 */
describe("Quality Gate: Homepage heading structure", () => {
  const source = fs.readFileSync(HOME_PAGE, "utf8");

  it("renders exactly one h1", () => {
    expect(source.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it("keeps the h1 out of the visual flow", () => {
    const openingTag = source.match(/<h1[^>]*>/)?.[0] ?? "";
    expect(openingTag).toContain("sr-only");
  });

  it("sources the h1 from the message bundles rather than literal copy", () => {
    const headingBlock = source.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? "";
    expect(headingBlock).toMatch(/tHero\(/);
    expect(headingBlock).not.toMatch(/>[A-Za-z]/);
  });
});
