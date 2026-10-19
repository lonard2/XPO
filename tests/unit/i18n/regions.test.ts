import { describe, it, expect, beforeEach } from "vitest";
import {
  regionForLocale,
  normalizeRegion,
  resolveActiveRegion,
  SUPPORTED_REGIONS,
} from "@/lib/i18n/regions";

describe("regionForLocale", () => {
  it("maps locales whose language implies exactly one edition", () => {
    expect(regionForLocale("ja")).toBe("jp");
    expect(regionForLocale("id")).toBe("id");
  });

  it("returns undefined for locales spanning several regions", () => {
    expect(regionForLocale("en")).toBeUndefined();
    expect(regionForLocale("de")).toBeUndefined();
    expect(regionForLocale("es")).toBeUndefined();
    expect(regionForLocale("zh-CN")).toBeUndefined();
    expect(regionForLocale(undefined)).toBeUndefined();
    expect(regionForLocale(null)).toBeUndefined();
  });

  it("is case insensitive", () => {
    expect(regionForLocale("JA")).toBe("jp");
    expect(regionForLocale("Id")).toBe("id");
  });
});

describe("normalizeRegion", () => {
  it("accepts only supported region codes", () => {
    for (const region of SUPPORTED_REGIONS) {
      expect(normalizeRegion(region)).toBe(region);
      expect(normalizeRegion(region.toUpperCase())).toBe(region);
    }
  });

  it("rejects unknown and empty values", () => {
    expect(normalizeRegion("us")).toBeUndefined();
    expect(normalizeRegion("")).toBeUndefined();
    expect(normalizeRegion(undefined)).toBeUndefined();
    expect(normalizeRegion(null)).toBeUndefined();
  });
});

describe("resolveActiveRegion", () => {
  it("serves the Japan edition for the ja locale with no other signal", () => {
    // Regression: `/ja` used to fall through to 'id' and render the Indonesia catalogue.
    expect(resolveActiveRegion({ locale: "ja" })).toBe("jp");
  });

  it("serves the Indonesia edition for the id locale", () => {
    expect(resolveActiveRegion({ locale: "id" })).toBe("id");
  });

  it("lets an explicit ?region= override the locale", () => {
    expect(resolveActiveRegion({ locale: "ja", explicitRegion: "global" })).toBe("global");
  });

  it("lets an explicit cookie override the locale", () => {
    expect(resolveActiveRegion({ locale: "ja", cookieRegion: "id" })).toBe("id");
  });

  it("prefers the explicit query over the cookie", () => {
    expect(
      resolveActiveRegion({ locale: "ja", explicitRegion: "global", cookieRegion: "id" })
    ).toBe("global");
  });

  it("lets the locale override an inferred geo region", () => {
    expect(resolveActiveRegion({ locale: "ja", geoRegion: "global" })).toBe("jp");
    expect(resolveActiveRegion({ locale: "id", geoRegion: "jp" })).toBe("id");
  });

  it("falls back to geo for locales that imply no region", () => {
    expect(resolveActiveRegion({ locale: "en", geoRegion: "jp" })).toBe("jp");
    expect(resolveActiveRegion({ locale: "de", geoRegion: "global" })).toBe("global");
  });

  it("defaults to 'id' when nothing is known", () => {
    expect(resolveActiveRegion({})).toBe("id");
    expect(resolveActiveRegion({ locale: "en" })).toBe("id");
  });

  it("ignores unrecognised values at every level", () => {
    expect(
      resolveActiveRegion({
        locale: "en",
        explicitRegion: "us",
        cookieRegion: "eu",
        geoRegion: "apac",
      })
    ).toBe("id");
  });

  it("always returns a supported region code", () => {
    const locales = ["en", "ja", "zh-CN", "id", "de", "es", undefined];
    const values = [undefined, null, "", "id", "jp", "global", "us"];
    for (const locale of locales) {
      for (const explicitRegion of values) {
        for (const cookieRegion of values) {
          for (const geoRegion of values) {
            const result = resolveActiveRegion({ locale, explicitRegion, cookieRegion, geoRegion });
            expect(SUPPORTED_REGIONS).toContain(result);
          }
        }
      }
    }
  });
});

describe("useActiveRegion", () => {
  const renderRegion = async (props?: { locale?: string; activeRegionCode?: string | null }) => {
    const { useActiveRegion } = await import("@/lib/i18n/useActiveRegion");
    const { renderHook } = await import("@testing-library/react");
    return renderHook(() => useActiveRegion(props));
  };

  beforeEach(() => {
    window.history.replaceState({}, "", "/en");
    document.cookie = "xpo_region=; path=/; max-age=0";
  });

  it("prefers ?region= over cookie and locale", async () => {
    window.history.replaceState({}, "", "/en?region=jp");
    document.cookie = "xpo_region=id; path=/";
    const { result } = await renderRegion({ locale: "en" });
    expect(result.current).toBe("jp");
  });

  it("prefers the cookie over the locale default", async () => {
    document.cookie = "xpo_region=global; path=/";
    const { result } = await renderRegion({ locale: "en" });
    expect(result.current).toBe("global");
  });

  it("falls back to the locale edition, then id", async () => {
    const { result: ja } = await renderRegion({ locale: "ja" });
    expect(ja.current).toBe("jp");
    const { result: en } = await renderRegion({ locale: "en" });
    expect(en.current).toBe("id");
  });

  it("lets an explicit parent code win", async () => {
    window.history.replaceState({}, "", "/en?region=jp");
    const { result } = await renderRegion({ locale: "en", activeRegionCode: "global" });
    expect(result.current).toBe("global");
  });
});
