import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SHELL = path.resolve(__dirname, "../../../src/components/themed/EventPageShell.tsx");
const PROGRAMS = path.resolve(__dirname, "../../../src/components/themed/ShowcaseProgramGrid.tsx");

/**
 * Structural guard for event-detail Expressive motion.
 *
 * The detail page is where the homepage hero sends visitors, but the shell
 * shipped with zero motion hooks: the metadata strip mounts all at once
 * and the program grid shared by every archetype view has hover-only
 * feedback. The h1 itself stays unanimated on purpose (largest-paint
 * element); everything around it cascades.
 */
describe("Quality Gate: Event-detail expressive wiring", () => {
  const shell = fs.readFileSync(SHELL, "utf8");
  const programs = fs.readFileSync(PROGRAMS, "utf8");

  const lineWith = (src: string, needle: string) =>
    src.split("\n").find((line) => line.includes(needle)) ?? "";

  it("cascades the hero metadata strip", () => {
    expect(lineWith(shell, "border-t border-white/10 grid")).toContain("stagger-children");
  });

  it("leaves the h1 unanimated for largest-paint", () => {
    const h1 = lineWith(shell, "drop-shadow-xs");
    expect(h1).toContain("<h1");
    expect(h1).not.toMatch(/stagger|animate|hero-/);
  });

  it("cascades the shared program grid with press physics on cards", () => {
    expect(lineWith(programs, "grid grid-cols-1 md:grid-cols-3")).toContain("stagger-children");
    expect(lineWith(programs, "<Card key={idx}")).toContain("card-interactive-3d");
  });
});
