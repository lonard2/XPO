import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SEED = path.resolve(__dirname, "../../../prisma/seed.ts");
const FALLBACK = path.resolve(__dirname, "../../../src/lib/discovery/fallbackData.ts");

/**
 * Photo ids confirmed to return 404 from images.unsplash.com.
 *
 * `1508098682722-e99c43a406b2` was seeded on both JIS (Jakarta International Stadium) and
 * Pacifico Yokohama Convention Center, so those two venue cards rendered broken-image chrome.
 * Listing the id here stops it being copied back in from history.
 *
 * Reachability itself is not asserted: that needs the network and would make the suite flaky
 * in CI. What is asserted is that the known-dead ids are gone and that every seeded URL is well
 * formed, which is what a bad paste or a typo would break.
 */
const DEAD_PHOTO_IDS = ["1508098682722-e99c43a406b2"];

const sources = [
  { name: "prisma/seed.ts", file: SEED },
  { name: "src/lib/discovery/fallbackData.ts", file: FALLBACK },
];

describe("Venue image data", () => {
  it("references no Unsplash photo id known to 404", () => {
    for (const { name, file } of sources) {
      const source = fs.readFileSync(file, "utf8");
      const present = DEAD_PHOTO_IDS.filter((id) => source.includes(id));

      expect({ file: name, present }).toEqual({ file: name, present: [] });
    }
  });

  it("keeps every seeded image URL well formed", () => {
    for (const { name, file } of sources) {
      const source = fs.readFileSync(file, "utf8");
      const urls = [...source.matchAll(/imageUrl:\s*["']([^"']+)["']/g)].map((match) => match[1]);

      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) {
        const wellFormed =
          /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?w=\d+$/.test(url) ||
          /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[\w/%().-]+\.(jpg|jpeg|png|webp)$/i.test(url);
        expect({ file: name, url, wellFormed }).toEqual({ file: name, url, wellFormed: true });
      }
    }
  });

  it("pins the two repaired venue images and keeps them distinct", () => {
    const seed = fs.readFileSync(SEED, "utf8");
    const jis = seed.match(/jis-jakarta[\s\S]*?imageUrl:\s*"([^"]+)"/)?.[1];
    const pacifico = seed.match(/pacifico-yokohama[\s\S]*?imageUrl:\s*"([^"]+)"/)?.[1];

    // JIS gets a track-and-field photo; Pacifico gets a plenary-hall photo.
    expect(jis).toBe("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200");
    expect(pacifico).toBe("https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200");
    expect(jis).not.toBe(pacifico);
  });
});
