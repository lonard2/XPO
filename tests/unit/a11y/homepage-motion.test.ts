import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const HOME_PAGE = path.resolve(__dirname, "../../../src/app/[locale]/(attendee)/page.tsx");

/**
 * Structural guard for homepage motion wiring.
 *
 * The site-wide MotionTilt engine, the card-interactive-3d press/lift
 * physics, the sheen sweep, and the stagger-children entrance cascade are
 * all delegated or class-driven: a surface only delights when it carries
 * the hook. Cards got theirs early; the homepage bento cells and grids did
 * not, so they mounted all at once with hover-only feedback.
 */
describe("Quality Gate: Homepage motion wiring", () => {
  const page = fs.readFileSync(HOME_PAGE, "utf8");

  it("cascades the featured grid, editor rows, and the bento grid entrances", () => {
    // Featured, editor rows (one class in source, one per row at runtime),
    // and bento.
    expect(page.match(/stagger-children/g) ?? []).toHaveLength(3);
    // Both grids render through the shared adaptive row.
    expect(page).toContain("<ResponsiveRow");
  });

  it("wires all three bento cells to the tilt engine with tactile physics", () => {
    expect(page.match(/data-tilt/g) ?? []).toHaveLength(3);
    expect(page.match(/card-interactive-3d/g) ?? []).toHaveLength(3);
  });

  it("gives the bento cells the expressive hover sheen", () => {
    const cells = page.match(/<div[^>]*card-interactive-3d[^>]*>/g) ?? [];
    expect(cells).toHaveLength(3);
    for (const cell of cells) expect(cell).toContain("sheen");
  });
});
