import { describe, it, expect } from "vitest";
import { auditUntranslatedValues } from "../../../scripts/lib/i18n-audit";

describe("untranslated value audit", () => {
  it("flags English prose copied into another locale", () => {
    const hits = auditUntranslatedValues();
    expect(hits).toContainEqual(
      expect.objectContaining({ locale: "de", key: "home.organizerPill1" })
    );
  });

  it("does not flag allowlisted proper nouns", () => {
    const hits = auditUntranslatedValues();
    expect(hits.some((hit) => hit.key === "regions.jp.keyVenues")).toBe(false);
  });

  it("does not flag values at or below the minimum length", () => {
    const hits = auditUntranslatedValues({ minLength: 18 });
    expect(hits.every((hit) => hit.value.length > 18)).toBe(true);
  });

  it("does not flag values without spaces", () => {
    const hits = auditUntranslatedValues();
    expect(hits.every((hit) => hit.value.includes(" "))).toBe(true);
  });

  it("reports one hit per locale and key", () => {
    const hits = auditUntranslatedValues();
    const keys = hits.map((hit) => `${hit.locale}:${hit.key}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("ignores the source locale", () => {
    const hits = auditUntranslatedValues();
    expect(hits.some((hit) => hit.locale === "en")).toBe(false);
  });
});
