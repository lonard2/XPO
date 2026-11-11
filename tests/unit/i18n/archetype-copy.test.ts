import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ARCHETYPE_LIST } from "@/lib/theming";

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");

const LATIN_LOCALES = ["en", "id", "de", "es"];
const CJK_LOCALES = ["ja", "zh-CN"];

// Measured in the normal four-column category grid (768px to 1280px, 195px
// text width): two lines hold 64 Latin characters and 36 CJK characters at
// the 11px subtitle size. A floor keeps the tiles from reading as two-word
// stubs; the ceiling keeps every subtitle on two full lines at tablet and
// desktop, while the existing line-clamp-2 trims cleanly on a 320px phone.
const LATIN_MIN = 45;
const LATIN_MAX = 60;
const CJK_MIN = 18;
const CJK_MAX = 32;

function descriptionFor(locale: string, id: string): string | undefined {
  const bundle = JSON.parse(
    fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf8")
  );
  return bundle.archetypes?.[id]?.description;
}

describe("Category tile copy", () => {
  it("keeps every category subtitle inside the two-line tile budget", () => {
    for (const locale of [...LATIN_LOCALES, ...CJK_LOCALES]) {
      const min = CJK_LOCALES.includes(locale) ? CJK_MIN : LATIN_MIN;
      const max = CJK_LOCALES.includes(locale) ? CJK_MAX : LATIN_MAX;
      for (const id of ARCHETYPE_LIST) {
        const text = descriptionFor(locale, id) ?? "";
        expect({ locale, id, short: text.length < min }).toEqual({
          locale,
          id,
          short: false,
        });
        expect({ locale, id, over: text.length > max }).toEqual({
          locale,
          id,
          over: false,
        });
        expect(text).not.toContain("\u2014");
        expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
      }
    }
  });
});
