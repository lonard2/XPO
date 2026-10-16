import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const qualified = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null ? flattenKeys(child, qualified) : [qualified];
  });
}

function loadBundle(locale: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf8"));
}

const locales = fs
  .readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""));

describe("Message bundle parity", () => {
  it("has the expected locale files", () => {
    expect(locales.sort()).toEqual(["de", "en", "es", "id", "ja", "zh-CN"].sort());
  });

  it("gives every locale the same set of keys as the default locale", () => {
    const defaultKeys = flattenKeys(loadBundle("en")).sort();

    for (const locale of locales) {
      const keys = flattenKeys(loadBundle(locale)).sort();
      const missing = defaultKeys.filter((key) => !keys.includes(key));
      const extra = keys.filter((key) => !defaultKeys.includes(key));

      // Reported separately so a failure names the offending keys instead of just counts.
      expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
    }
  });

  it("avoids em dashes in translated copy", () => {
    for (const locale of locales) {
      const emDashes = flattenKeys(loadBundle(locale)).filter((key) => {
        const segments = key.split(".");
        let node: unknown = loadBundle(locale);
        for (const segment of segments) {
          node = (node as Record<string, unknown>)[segment];
        }
        return typeof node === "string" && node.includes("\u2014");
      });

      expect({ locale, emDashes }).toEqual({ locale, emDashes: [] });
    }
  });

  it("keeps ICU placeholders consistent across locales", () => {
    const defaultBundle = loadBundle("en");
    const readPath = (bundle: Record<string, unknown>, key: string) =>
      key.split(".").reduce<unknown>((node, segment) => (node as Record<string, unknown>)?.[segment], bundle);

    for (const key of flattenKeys(defaultBundle)) {
      const reference = readPath(defaultBundle, key);
      if (typeof reference !== "string") continue;
      const expected = (reference.match(/\{(\w+)\}/g) ?? []).sort();

      for (const locale of locales) {
        const value = readPath(loadBundle(locale), key);
        if (typeof value !== "string") continue;
        const actual = (value.match(/\{(\w+)\}/g) ?? []).sort();

        expect({ key, locale, actual }).toEqual({ key, locale, actual: expected });
      }
    }
  });
});
