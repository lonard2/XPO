import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const CSS = path.resolve(__dirname, "../../../src/app/globals.css");

/**
 * Structural guard for motion-system composability.
 *
 * The MotionTilt engine drives pointer tilt through inline `transform`
 * styles. A finished CSS animation with a retained fill (`both`/`forwards`)
 * keeps overriding inline styles forever — so an entrance that pins
 * `translateY(0)` silently kills tilt on every card inside a staggered
 * grid. The stagger therefore uses `backwards` fill: the `from` state still
 * covers the delay (no flash), but nothing is retained after finishing.
 */
describe("Quality Gate: Motion-system composability", () => {
  // Strip comments so rule assertions never trip on prose.
  const css = fs.readFileSync(CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  it("stagger entrance releases transforms after finishing (tilt-compatible)", () => {
    const rule = css.match(/\.stagger-children > \* \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toContain("rise-in");
    expect(rule).not.toMatch(/both|forwards/);
    expect(rule).toMatch(/backwards/);
  });

  it("hero crossfade stays opacity-only (no transform pinning on slide layers)", () => {
    const keyframes = css.match(/@keyframes hero-crossfade \{[^}]*\}[^}]*\}/)?.[0] ?? "";
    expect(keyframes).not.toMatch(/transform/);
  });

  it("hero crossfade releases after finishing (axe-readable steady state)", () => {
    const rule = css.match(/\.hero-crossfade-in \{[^}]*\}/)?.[0] ?? "";
    expect(rule).not.toMatch(/both|forwards/);
    expect(rule).toMatch(/backwards/);
  });

  it("ambient glow paints above host backgrounds (stacking context, not buried)", () => {
    const rule = css.match(/\.ambient-glow \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toMatch(/isolation:\s*isolate/);
  });
});
