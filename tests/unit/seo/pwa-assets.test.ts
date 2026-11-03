import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import manifest from "@/app/manifest";

const iconsDir = join(process.cwd(), "public", "icons");

describe("PWA icon assets", () => {
  it("ships every file the web manifest references", () => {
    const webmanifest = manifest();
    const sources = [
      ...(webmanifest.icons ?? []).map((icon) => icon.src),
      ...(webmanifest.shortcuts ?? []).flatMap((shortcut) =>
        (shortcut.icons ?? []).map((icon) => icon.src)
      ),
    ];
    expect(sources.length).toBeGreaterThan(0);
    for (const src of sources) {
      expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
    }
  });

  it("ships the apple touch icon and favicons the layout references", () => {
    for (const file of ["apple-touch-icon.png", "favicon-32x32.png", "favicon-16x16.png"]) {
      expect(existsSync(join(iconsDir, file))).toBe(true);
    }
  });

  it("keeps maskable icons at purpose maskable", () => {
    const webmanifest = manifest();
    const maskable = (webmanifest.icons ?? []).filter((icon) => icon.purpose === "maskable");
    expect(maskable.length).toBeGreaterThanOrEqual(2);
  });
});
