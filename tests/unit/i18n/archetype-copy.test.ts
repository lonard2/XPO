import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ARCHETYPE_LIST } from "@/lib/theming";

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");

const LATIN_LOCALES = ["en", "id", "de", "es"];
const CJK_LOCALES = ["ja", "zh-CN"];

// Measured in the rendered category tile at 320px, the narrowest supported
// viewport: two lines hold 29 Latin characters and 19 CJK characters at the
// 11px subtitle size. One character of margin absorbs word-boundary wraps.
const LATIN_BUDGET = 27;
const CJK_BUDGET = 18;

function descriptionFor(locale: string, id: string): string | undefined {
  const bundle = JSON.parse(
    fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf8")
  );
  return bundle.archetypes?.[id]?.description;
}

describe("Category tile copy", () => {
  it("keeps every category subtitle inside the two-line tile budget", () => {
    for (const locale of [...LATIN_LOCALES, ...CJK_LOCALES]) {
      const budget = CJK_LOCALES.includes(locale) ? CJK_BUDGET : LATIN_BUDGET;
      for (const id of ARCHETYPE_LIST) {
        const text = descriptionFor(locale, id) ?? "";
        expect({ locale, id, missing: text.length === 0 }).toEqual({
          locale,
          id,
          missing: false,
        });
        expect({ locale, id, over: text.length > budget }).toEqual({
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
