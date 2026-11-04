import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const GUIDE = path.resolve(__dirname, "../../../src/components/organizer/OrganizerOnboardingGuide.tsx");

/**
 * Structural guard for organizer-onboarding motion.
 *
 * The 4-milestone grid is a first-run moment, so its entrance cascades.
 * The milestone cells themselves stay free of press/tilt hooks on purpose:
 * they are containers, not controls — only the links inside them are
 * interactive, and motion must never imply otherwise.
 */
describe("Quality Gate: Organizer-onboarding motion", () => {
  const src = fs.readFileSync(GUIDE, "utf8");

  const lineWith = (needle: string) =>
    src.split("\n").find((line) => line.includes(needle)) ?? "";

  it("cascades the 4-milestone grid entrance", () => {
    expect(lineWith("lg:grid-cols-4 gap-3")).toContain("stagger-children");
  });

  it("keeps press and tilt hooks off the non-interactive milestone cells", () => {
    const cell = lineWith("p-3.5 rounded-xl border flex flex-col");
    expect(cell).not.toMatch(/card-interactive-3d|data-tilt/);
  });
});
