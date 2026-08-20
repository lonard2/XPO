import { describe, it, expect } from "vitest";
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
} from "@/lib/i18n/formatters";

describe("i18n Formatters: Currency Formatting", () => {
  it("formats IDR correctly without decimal places", () => {
    const formattedId = formatCurrency(450000, "IDR", "id");
    // Indonesian format: Rp450.000 or Rp 450.000
    expect(formattedId).toMatch(/Rp\s?450\.000/);

    const formattedEn = formatCurrency(450000, "IDR", "en");
    expect(formattedEn).toMatch(/IDR|Rp/);
    expect(formattedEn).toContain("450,000");
  });

  it("formats JPY correctly without decimal places", () => {
    const formattedJa = formatCurrency(15000, "JPY", "ja");
    // Japanese format: ¥15,000 or ￥15,000
    expect(formattedJa).toMatch(/[¥￥]\s?15,000/);

    const formattedEn = formatCurrency(15000, "JPY", "en");
    expect(formattedEn).toMatch(/[¥￥]\s?15,000/);
  });

  it("formats USD, EUR, SGD with standard currency symbols", () => {
    const usd = formatCurrency(150.5, "USD", "en");
    expect(usd).toContain("$150.50");

    const eur = formatCurrency(200, "EUR", "de");
    expect(eur).toContain("200");
    expect(eur).toContain("€");

    const sgd = formatCurrency(99, "SGD", "en");
    expect(sgd).toMatch(/SGD|S\$/);
    expect(sgd).toContain("99");
  });

  it("handles edge cases: zero, negative numbers, large amounts, and invalid inputs", () => {
    expect(formatCurrency(0, "USD", "en")).toBe("$0");
    expect(formatCurrency(-500, "USD", "en")).toContain("-");
    expect(formatCurrency(1000000000, "IDR", "en")).toContain("1,000,000,000");

    // Invalid number fallback
    expect(formatCurrency(NaN as any, "USD", "en")).toBe("$0");
  });

  it("handles unsupported currency/locale by falling back gracefully", () => {
    const fallbackCurrency = formatCurrency(100, "XYZ" as any, "en");
    expect(fallbackCurrency).toContain("100");

    const fallbackLocale = formatCurrency(100, "USD", "xx-YY");
    expect(fallbackLocale).toContain("100");
  });
});

describe("i18n Formatters: Date & Time Range Formatting", () => {
  it("formats multi-day same-month date ranges with timezone", () => {
    // 09:00 UTC = 16:00 WIB; 11:00 UTC = 18:00 WIB (Sep 17)
    const start = new Date("2026-09-14T09:00:00Z");
    const end = new Date("2026-09-17T11:00:00Z");

    const rangeEn = formatDateRange(start, end, "en", "Asia/Jakarta");
    expect(rangeEn).toContain("Sep");
    expect(rangeEn).toContain("2026");
    expect(rangeEn).toMatch(/14.*17/);

    const rangeId = formatDateRange(start, end, "id", "Asia/Jakarta");
    expect(rangeId).toContain("Sep");
    expect(rangeId).toContain("2026");
  });

  it("shifts date accurately when crossing midnight across timezones", () => {
    // 2026-09-17T18:00:00Z in UTC is Sep 17, but in Asia/Jakarta (UTC+7) it is Sep 18 01:00
    const start = new Date("2026-09-14T09:00:00Z");
    const end = new Date("2026-09-17T18:00:00Z");

    const rangeUtc = formatDateRange(start, end, "en", "UTC");
    expect(rangeUtc).toMatch(/14.*17/);

    const rangeWib = formatDateRange(start, end, "en", "Asia/Jakarta");
    expect(rangeWib).toMatch(/14.*18/);
  });

  it("formats cross-month date ranges correctly", () => {
    const start = new Date("2026-06-10T10:00:00Z");
    const end = new Date("2026-07-12T15:00:00Z");

    const range = formatDateRange(start, end, "en", "Asia/Jakarta");
    expect(range).toContain("Jun");
    expect(range).toContain("Jul");
    expect(range).toContain("2026");
  });

  it("formats cross-year date ranges correctly", () => {
    const start = new Date("2026-12-28T09:00:00Z");
    const end = new Date("2027-01-03T18:00:00Z");

    const range = formatDateRange(start, end, "en", "UTC");
    expect(range).toContain("2026");
    expect(range).toContain("2027");
  });

  it("handles ISO string date inputs seamlessly", () => {
    const range = formatDateRange(
      "2026-10-08T08:30:00Z",
      "2026-10-10T10:00:00Z",
      "en",
      "Asia/Tokyo"
    );
    expect(range).toContain("Oct");
    expect(range).toContain("2026");
  });

  it("handles single date and invalid date errors gracefully", () => {
    expect(formatDateRange("invalid-date", "2026-10-10", "en")).toBe("Invalid Date");
    expect(formatDate("2026-09-14T09:00:00Z", "en", "UTC")).toContain("Sep 14, 2026");
    expect(formatTime("2026-09-14T10:30:00Z", "en", "UTC")).toMatch(/10:30/);
  });
});

describe("i18n Formatters: Direction & Regional Mapping", () => {
  it("returns ltr for all standard supported languages", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(getLocaleDirection(locale)).toBe("ltr");
    }
  });

  it("returns rtl for Arabic / Hebrew / Farsi", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("he")).toBe("rtl");
    expect(getLocaleDirection("fa")).toBe("rtl");
  });

  it("maps region codes to primary timezones correctly", () => {
    expect(getTimeZoneForRegion("id")).toBe("Asia/Jakarta");
    expect(getTimeZoneForRegion("ID")).toBe("Asia/Jakarta");
    expect(getTimeZoneForRegion("indonesia")).toBe("Asia/Jakarta");

    expect(getTimeZoneForRegion("jp")).toBe("Asia/Tokyo");
    expect(getTimeZoneForRegion("JP")).toBe("Asia/Tokyo");
    expect(getTimeZoneForRegion("japan")).toBe("Asia/Tokyo");

    expect(getTimeZoneForRegion("global")).toBe("UTC");
    expect(getTimeZoneForRegion("GL")).toBe("UTC");
    expect(getTimeZoneForRegion("unknown")).toBe("UTC");
  });

  it("maps region codes to default currencies correctly", () => {
    expect(getCurrencyForRegion("id")).toBe("IDR");
    expect(getCurrencyForRegion("ID")).toBe("IDR");
    expect(getCurrencyForRegion("jp")).toBe("JPY");
    expect(getCurrencyForRegion("JP")).toBe("JPY");
    expect(getCurrencyForRegion("global")).toBe("USD");
  });

  it("validates and normalizes supported locales and currencies", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("ja")).toBe(true);
    expect(isValidLocale("zh-CN")).toBe(true);
    expect(isValidLocale("id")).toBe(true);
    expect(isValidLocale("de")).toBe(true);
    expect(isValidLocale("es")).toBe(true);
    expect(isValidLocale("fr")).toBe(false);

    expect(isValidCurrency("IDR")).toBe(true);
    expect(isValidCurrency("JPY")).toBe(true);
    expect(isValidCurrency("USD")).toBe(true);
    expect(isValidCurrency("EUR")).toBe(true);
    expect(isValidCurrency("SGD")).toBe(true);
    expect(isValidCurrency("GBP")).toBe(false);

    expect(normalizeLocale("ja-JP")).toBe("ja");
    expect(normalizeLocale("de-DE")).toBe("de");
    expect(normalizeLocale("unknown")).toBe("en");
  });

  it("formats numbers with proper localized grouping separators", () => {
    const formattedEn = formatNumber(1250000, "en");
    expect(formattedEn).toBe("1,250,000");

    const formattedDe = formatNumber(1250000, "de");
    // German uses period or non-breaking space for thousands
    expect(formattedDe).toMatch(/1[.\s]250[.\s]000/);
  });
});
