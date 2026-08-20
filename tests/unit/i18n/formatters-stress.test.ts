import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  formatCurrency,
  formatDateRange,
  formatDate,
  formatTime,
  formatNumber,
  getLocaleDirection,
  getTimeZoneForRegion,
  getCurrencyForRegion,
  isValidLocale,
  isValidCurrency,
  normalizeLocale,
  SUPPORTED_LOCALES,
  SUPPORTED_CURRENCIES,
  SupportedLocale,
  SupportedCurrency,
} from "@/lib/i18n/formatters";

describe("Empirical Challenge: Currency Formatter Edge Cases", () => {
  const testLocales: SupportedLocale[] = ["en", "ja", "zh-CN", "id", "de", "es"];
  const testCurrencies: SupportedCurrency[] = ["IDR", "JPY", "USD", "EUR", "SGD"];

  it("handles zero (0 and -0) across all supported currencies and locales without NaN or error", () => {
    for (const locale of testLocales) {
      for (const curr of testCurrencies) {
        const res0 = formatCurrency(0, curr, locale);
        const resNeg0 = formatCurrency(-0, curr, locale);
        expect(res0).not.toContain("NaN");
        expect(resNeg0).not.toContain("NaN");
        expect(res0.length).toBeGreaterThan(0);
        expect(resNeg0.length).toBeGreaterThan(0);

        if (curr === "IDR" || curr === "JPY") {
          // Zero decimal places required for IDR and JPY
          expect(res0).not.toMatch(/\.00|,00/);
        }
      }
    }
  });

  it("handles negative amounts accurately with minus sign or parenthesis", () => {
    // Negative IDR: -1,500,000
    const negIdr = formatCurrency(-1500000, "IDR", "id");
    expect(negIdr).toMatch(/-|−/);
    expect(negIdr).toContain("1.500.000");

    // Negative USD: -45.75
    const negUsd = formatCurrency(-45.75, "USD", "en");
    expect(negUsd).toMatch(/-|−|\(/);
    expect(negUsd).toContain("45.75");

    // Small negative fraction: -0.01 USD
    const negCents = formatCurrency(-0.01, "USD", "en");
    expect(negCents).toMatch(/-|−|\(/);
    expect(negCents).toContain("0.01");
  });

  it("handles fractional amounts for zero-decimal currencies (IDR, JPY) by rounding without decimals", () => {
    // IDR with fractional amount 450000.85 should round to 450001 or 450000 without decimal digits
    const fracIdr = formatCurrency(450000.85, "IDR", "id");
    expect(fracIdr).not.toContain(",85");
    expect(fracIdr).not.toContain(".85");
    expect(fracIdr).not.toContain("NaN");

    // JPY with fractional amount 12500.49 should round without decimals
    const fracJpy = formatCurrency(12500.49, "JPY", "ja");
    expect(fracJpy).not.toContain(".49");
    expect(fracJpy).not.toContain(",49");
    expect(fracJpy).not.toContain("NaN");
  });

  it("handles multi-billion and trillion scale amounts (IDR & JPY) without overflow or scientific notation", () => {
    // 500 Billion IDR (e.g. Government/Mega Expo budget)
    const billionIdr = formatCurrency(500_000_000_000, "IDR", "id");
    expect(billionIdr).not.toContain("e+");
    expect(billionIdr).toContain("500.000.000.000");

    // 10 Trillion IDR
    const trillionIdr = formatCurrency(10_000_000_000_000, "IDR", "en");
    expect(trillionIdr).not.toContain("e+");
    expect(trillionIdr).toContain("10,000,000,000,000");

    // 2.5 Billion JPY
    const billionJpy = formatCurrency(2_500_000_000, "JPY", "ja");
    expect(billionJpy).not.toContain("e+");
    expect(billionJpy).toContain("2,500,000,000");

    // JavaScript MAX_SAFE_INTEGER
    const maxSafe = formatCurrency(Number.MAX_SAFE_INTEGER, "USD", "en");
    expect(maxSafe).not.toContain("NaN");
    expect(maxSafe).not.toContain("e+");
  });

  it("robustly handles non-numeric and pathological inputs", () => {
    expect(formatCurrency(NaN, "USD", "en")).toBe("$0");
    expect(formatCurrency(Infinity, "USD", "en")).not.toContain("NaN");
    expect(formatCurrency(-Infinity, "USD", "en")).not.toContain("NaN");
    expect(formatCurrency(null as any, "USD", "en")).toBe("$0");
    expect(formatCurrency(undefined as any, "USD", "en")).toBe("$0");
    expect(formatCurrency("1000" as any, "USD", "en")).not.toContain("NaN");
    expect(formatCurrency({} as any, "USD", "en")).toBe("$0");
  });

  it("gracefully falls back when unsupported currency or locale is supplied", () => {
    const invalidCurr = formatCurrency(500, "INVALID_CURR" as any, "en");
    expect(invalidCurr).toContain("500");
    expect(invalidCurr).not.toContain("NaN");

    const invalidLocale = formatCurrency(500, "USD", "klingon-KL");
    expect(invalidLocale).toContain("500");
    expect(invalidLocale).not.toContain("NaN");
  });
});

describe("Empirical Challenge: Timezone & Date Formatting Across Boundaries & Leap Years", () => {
  it("accurately handles Leap Day (Feb 29, 2024 and Feb 29, 2028)", () => {
    const leapStart = new Date("2024-02-28T10:00:00Z");
    const leapEnd = new Date("2024-03-01T10:00:00Z");

    const leapRangeEn = formatDateRange(leapStart, leapEnd, "en", "UTC");
    expect(leapRangeEn).toContain("Feb 28");
    expect(leapRangeEn).toContain("Mar 1");
    expect(leapRangeEn).toContain("2024");

    const leapDay = formatDate("2024-02-29T12:00:00Z", "en", "UTC");
    expect(leapDay).toContain("Feb 29, 2024");

    // 2028 leap year
    const leap2028 = formatDate("2028-02-29T12:00:00Z", "en", "UTC");
    expect(leap2028).toContain("Feb 29, 2028");
  });

  it("accurately handles non-leap year Feb 28 to Mar 1 transitions", () => {
    const nonLeapStart = new Date("2025-02-28T10:00:00Z");
    const nonLeapEnd = new Date("2025-03-01T10:00:00Z");

    const nonLeapRange = formatDateRange(nonLeapStart, nonLeapEnd, "en", "UTC");
    expect(nonLeapRange).toContain("Feb 28");
    expect(nonLeapRange).toContain("Mar 1");
    expect(nonLeapRange).toContain("2025");
  });

  it("handles New Year boundary where UTC is 2026 but Asia/Jakarta (UTC+7) or Asia/Tokyo (UTC+9) is 2027", () => {
    // 2026-12-31T20:00:00Z:
    // UTC: Dec 31, 2026, 20:00
    // Asia/Jakarta (UTC+7): Jan 1, 2027, 03:00
    // Asia/Tokyo (UTC+9): Jan 1, 2027, 05:00
    const newYearUtc = "2026-12-31T20:00:00Z";

    const dateUtc = formatDate(newYearUtc, "en", "UTC");
    expect(dateUtc).toContain("Dec 31, 2026");

    const dateWib = formatDate(newYearUtc, "en", "Asia/Jakarta");
    expect(dateWib).toContain("Jan 1, 2027");

    const dateJst = formatDate(newYearUtc, "en", "Asia/Tokyo");
    expect(dateJst).toContain("Jan 1, 2027");
  });

  it("handles date ranges crossing year boundaries across different timezones", () => {
    // Start: Dec 30, 2026 15:00 UTC (22:00 WIB, Dec 30)
    // End: Jan 2, 2027 03:00 UTC (10:00 WIB, Jan 2)
    const range = formatDateRange(
      "2026-12-30T15:00:00Z",
      "2027-01-02T03:00:00Z",
      "en",
      "Asia/Jakarta"
    );
    expect(range).toContain("2026");
    expect(range).toContain("2027");
    expect(range).toContain("Dec 30");
    expect(range).toContain("Jan 2");
  });

  it("formats identical start and end timestamps as a single date without duplicate range text", () => {
    const single = formatDateRange(
      "2026-09-14T09:00:00Z",
      "2026-09-14T09:00:00Z",
      "en",
      "UTC"
    );
    // Should format as "Sep 14, 2026", not "Sep 14, 2026 – Sep 14, 2026"
    expect(single).toContain("Sep 14, 2026");
    const countSep = (single.match(/Sep 14/g) || []).length;
    expect(countSep).toBe(1);
  });

  it("handles pathological date inputs gracefully without crashing", () => {
    expect(formatDateRange("invalid-date", "2026-10-10", "en")).toBe("Invalid Date");
    expect(formatDateRange("2026-10-10", "invalid-date", "en")).toContain("2026");
    expect(formatDate("not-a-valid-date", "en", "UTC")).toBe("Invalid Date");
    expect(formatTime("not-a-valid-date", "en", "UTC")).toBe("Invalid Date");
    expect(formatDate(null as any, "en")).toBe("Invalid Date");
    expect(formatDate(undefined as any, "en")).toBe("Invalid Date");
  });
});

describe("Empirical Challenge: Missing Locale & Dictionary Parity", () => {
  const supportedLocales: SupportedLocale[] = ["en", "ja", "zh-CN", "id", "de", "es"];
  const messagesDir = path.resolve(__dirname, "../../../src/messages");

  it("normalizes standard and regional locale string inputs to supported locales", () => {
    expect(normalizeLocale("ja-JP")).toBe("ja");
    expect(normalizeLocale("ZH-CN")).toBe("zh-CN");
    expect(normalizeLocale("zh-TW")).toBe("zh-CN");
    expect(normalizeLocale("id-ID")).toBe("id");
    expect(normalizeLocale("de-AT")).toBe("de");
    expect(normalizeLocale("es-ES")).toBe("es");
    expect(normalizeLocale("es-MX")).toBe("es");
    expect(normalizeLocale("fr-FR")).toBe("en");
    expect(normalizeLocale("unknown-locale")).toBe("en");
    expect(normalizeLocale("")).toBe("en");
  });

  function getNestedKeys(obj: any, prefix = ""): string[] {
    let keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
        keys = keys.concat(getNestedKeys(obj[k], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  it("verifies 100% key parity across all 6 language dictionary files against en.json", () => {
    const enFilePath = path.join(messagesDir, "en.json");
    expect(fs.existsSync(enFilePath)).toBe(true);

    const enContent = JSON.parse(fs.readFileSync(enFilePath, "utf-8"));
    const enKeys = getNestedKeys(enContent);

    expect(enKeys.length).toBeGreaterThan(50);

    for (const locale of supportedLocales) {
      if (locale === "en") continue;
      const localePath = path.join(messagesDir, `${locale}.json`);
      expect(fs.existsSync(localePath), `Dictionary for ${locale} must exist`).toBe(true);

      const localeContent = JSON.parse(fs.readFileSync(localePath, "utf-8"));
      const localeKeys = getNestedKeys(localeContent);

      const missingKeys = enKeys.filter((k) => !localeKeys.includes(k));
      const extraKeys = localeKeys.filter((k) => !enKeys.includes(k));

      expect(
        missingKeys,
        `Locale ${locale}.json is missing keys present in en.json: ${missingKeys.join(", ")}`
      ).toEqual([]);

      expect(
        extraKeys,
        `Locale ${locale}.json has extraneous keys not in en.json: ${extraKeys.join(", ")}`
      ).toEqual([]);
    }
  });

  it("verifies all 12 core functional domains exist in every message dictionary", () => {
    const requiredDomains = [
      "common",
      "nav",
      "hero",
      "regions",
      "archetypes",
      "discovery",
      "tickets",
      "perks",
      "settings",
      "organizer",
      "admin",
      "ai",
    ];

    for (const locale of supportedLocales) {
      const filePath = path.join(messagesDir, `${locale}.json`);
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      for (const domain of requiredDomains) {
        expect(content[domain], `Domain '${domain}' missing in ${locale}.json`).toBeDefined();
      }
    }
  });
});

describe("Empirical Challenge: Zero-Emoji Compliance Across All Code & Dictionaries", () => {
  // Comprehensive unicode emoji regex including extended pictographs, emoticons, symbols, flags, dingbats
  const extendedEmojiRegex =
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FAFF}\u{1F004}\u{1F0CF}]/u;

  const srcDir = path.resolve(__dirname, "../../../src");

  function scanAllFiles(dir: string, extensions: string[]): { file: string; match: string }[] {
    const violations: { file: string; match: string }[] = [];
    function walk(current: string) {
      if (!fs.existsSync(current)) return;
      const entries = fs.readdirSync(current);
      for (const entry of entries) {
        const full = path.join(current, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
          const content = fs.readFileSync(full, "utf-8");
          const match = content.match(extendedEmojiRegex);
          if (match) {
            violations.push({ file: path.relative(srcDir, full), match: match[0] });
          }
        }
      }
    }
    walk(dir);
    return violations;
  }

  it("verifies zero raw emojis across all TypeScript and TSX source files in src/", () => {
    const violations = scanAllFiles(srcDir, [".ts", ".tsx"]);
    expect(
      violations,
      `Detected emoji violations in src/: ${JSON.stringify(violations)}`
    ).toHaveLength(0);
  });

  it("verifies zero raw emojis across all translation dictionary JSON files in src/messages/", () => {
    const messagesDir = path.resolve(srcDir, "messages");
    const violations = scanAllFiles(messagesDir, [".json"]);
    expect(
      violations,
      `Detected emoji violations in src/messages/: ${JSON.stringify(violations)}`
    ).toHaveLength(0);
  });

  it("verifies all UI components in src/components/ layout and navigation use vector icons", () => {
    const layoutDir = path.resolve(srcDir, "components/layout");
    if (fs.existsSync(layoutDir)) {
      const files = fs.readdirSync(layoutDir);
      for (const file of files) {
        if (file.endsWith(".tsx")) {
          const content = fs.readFileSync(path.join(layoutDir, file), "utf-8");
          // Ensure lucide-react is imported whenever icons are used
          if (content.includes("Icon") || content.includes("Globe") || content.includes("MapPin")) {
            expect(content).toContain("lucide-react");
          }
        }
      }
    }
  });
});
