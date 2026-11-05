import { describe, it, expect } from "vitest";
import {
  EDITORIAL_LOCALES,
  resolveEditorialBlurb,
} from "@/lib/discovery/editorial";

describe("Editorial blurb locale resolution", () => {
  const blurb = "Editors pick: the region's flagship automation expo.";

  it("exposes the six dictionary locales in order", () => {
    expect([...EDITORIAL_LOCALES]).toEqual([
      "en",
      "id",
      "ja",
      "zh-CN",
      "de",
      "es",
    ]);
  });

  it("returns null when the blurb is not approved, even with text", () => {
    expect(
      resolveEditorialBlurb({
        approved: false,
        blurb,
        i18n: { id: "Pilihan editor." },
        locale: "id",
      })
    ).toBeNull();
  });

  it("prefers the exact locale override, including zh-CN", () => {
    expect(
      resolveEditorialBlurb({
        approved: true,
        blurb,
        i18n: { "zh-CN": "编辑推荐" },
        locale: "zh-CN",
      })
    ).toBe("编辑推荐");
  });

  it("falls back to the default when the locale has no override", () => {
    expect(
      resolveEditorialBlurb({
        approved: true,
        blurb,
        i18n: { id: "Pilihan editor." },
        locale: "de",
      })
    ).toBe(blurb);
  });

  it("treats an empty-string override as unset, never rendering blank", () => {
    const result = resolveEditorialBlurb({
      approved: true,
      blurb,
      i18n: { de: "   " },
      locale: "de",
    });
    expect(result).toBe(blurb);
    expect(result).not.toBe("");
  });

  it("returns null when neither override nor default exists", () => {
    expect(
      resolveEditorialBlurb({
        approved: true,
        blurb: null,
        i18n: null,
        locale: "en",
      })
    ).toBeNull();
  });

  it("ignores unknown extra keys in the i18n map", () => {
    expect(
      resolveEditorialBlurb({
        approved: true,
        blurb,
        i18n: { xx: "Xyz", id: "Pilihan editor." },
        locale: "xx",
      })
    ).toBe(blurb);
  });
});
