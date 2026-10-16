import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getContrastRatio } from "@/lib/theming";

const GLOBALS_CSS = path.join(process.cwd(), "src", "app", "globals.css");

/** Extracts the `--var: value` declarations inside a top-level CSS rule. */
function readRule(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`rule ${selector} not found in globals.css`);

  let depth = 0;
  let end = start;
  for (let i = css.indexOf("{", start); i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const variables: Record<string, string> = {};
  for (const match of css.slice(start, end).matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    variables[match[1]] = match[2].trim();
  }
  return variables;
}

/** globals.css stores most colours as bare HSL triples, e.g. `221 83% 53%`. */
function hslTripleToHex(triple: string): string {
  const match = triple.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) throw new Error(`not an HSL triple: ${triple}`);

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const channel = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

const css = fs.readFileSync(GLOBALS_CSS, "utf8");
const light = readRule(css, ":root");
const dark = readRule(css, ".dark");

/** Contrast of the foreground token against the surface it is rendered on. */
function ratioOn(surface: string, foreground: string): number {
  const resolve = (value: string) => (value.startsWith("#") ? value : hslTripleToHex(value));
  return getContrastRatio(resolve(foreground), resolve(surface));
}

describe("Theme token contrast (WCAG AA for small text)", () => {
  it("parses the light and dark token blocks", () => {
    expect(light.primary).toBeDefined();
    expect(dark.primary).toBeDefined();
    expect(light["archetype-surface"]).toBeDefined();
    expect(dark["archetype-surface"]).toBeDefined();
  });

  it("keeps primary foreground legible on primary in both themes", () => {
    expect(ratioOn(light.primary, light["primary-foreground"])).toBeGreaterThanOrEqual(4.5);
    expect(ratioOn(dark.primary, dark["primary-foreground"])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the archetype ink legible on the archetype surface in both themes", () => {
    // Regression: --archetype-primary stayed #2563eb in dark mode while the archetype
    // surface darkened to #0f172a, giving 3.5:1 on the role badge and archetype chips.
    expect(ratioOn(light["archetype-surface"], light["archetype-primary"])).toBeGreaterThanOrEqual(4.5);
    expect(ratioOn(dark["archetype-surface"], dark["archetype-primary"])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the dark archetype ink lighter than the dark archetype surface", () => {
    const luminance = (hex: string) => {
      const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      const linear = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };

    expect(luminance(dark["archetype-primary"])).toBeGreaterThan(luminance(dark["archetype-surface"]));
  });

  it("keeps muted text legible on the muted surface in both themes", () => {
    // Regression: light-mode --muted-foreground was #64748b, only 4.2-4.3:1 on --muted
    // and on bg-primary/10 tints.
    expect(ratioOn(light.muted, light["muted-foreground"])).toBeGreaterThanOrEqual(4.5);
    expect(ratioOn(dark.muted, dark["muted-foreground"])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps muted text legible on a 10% primary tint in light mode", () => {
    // Cluster count chips and the calendar "today" cell sit on this tint.
    const primaryTint = "#e6eefc";
    expect(ratioOn(primaryTint, light["muted-foreground"])).toBeGreaterThanOrEqual(4.5);
  });
});
