import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const BANNER = path.resolve(
  __dirname,
  "../../../src/components/discovery/BannerCarousel.tsx"
);
const IDENTITY = path.resolve(
  __dirname,
  "../../../src/components/discovery/IdentityStrip.tsx"
);

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.03928
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

describe("Quality Gate: live-state contrast", () => {
  it("keeps white text on emerald-700 above the AA floor", () => {
    expect(contrast("#047857", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("uses emerald-700 for the Happening Now badge", () => {
    const banner = fs.readFileSync(BANNER, "utf8");
    expect(banner).toContain("bg-emerald-700");
    expect(banner).not.toContain("bg-emerald-600");
  });

  it("keeps the H1 on the documented type ramp", () => {
    const identity = fs.readFileSync(IDENTITY, "utf8");
    expect(identity).not.toContain("text-[1.7rem]");
    expect(identity).toContain("text-3xl");
  });

  it("uses a hairline accent border on the hero story panel", () => {
    const banner = fs.readFileSync(BANNER, "utf8");
    expect(banner).not.toContain("border-l-4");
  });
});
