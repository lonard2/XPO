import { describe, it, expect } from "vitest";
import * as path from "path";
import { auditUntranslatedValues } from "../../../scripts/lib/i18n-audit";

const MESSAGES = path.resolve(__dirname, "../../fixtures/i18n/messages");

describe("untranslated value audit", () => {
  it("flags English prose copied into another locale", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES });
    expect(hits).toContainEqual(
      expect.objectContaining({ locale: "de", key: "home.copied" })
    );
  });

  it("does not flag allowlisted proper nouns", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES });
    expect(hits.some((hit) => hit.key === "home.brand")).toBe(false);
  });

  it("does not flag values at or below the minimum length", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES, minLength: 18 });
    expect(hits.some((hit) => hit.key === "home.short")).toBe(false);
    expect(hits.every((hit) => hit.value.length > 18)).toBe(true);
  });

  it("does not flag values without spaces", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES });
    expect(hits.some((hit) => hit.key === "home.single")).toBe(false);
    expect(hits.every((hit) => hit.value.includes(" "))).toBe(true);
  });

  it("does not flag a value that was actually translated", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES });
    expect(hits.some((hit) => hit.key === "home.translated")).toBe(false);
  });

  it("reports one hit per locale and key", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES });
    const keys = hits.map((hit) => `${hit.locale}:${hit.key}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("ignores the source locale", () => {
    const hits = auditUntranslatedValues({ messagesDir: MESSAGES });
    expect(hits.some((hit) => hit.locale === "en")).toBe(false);
  });
});
