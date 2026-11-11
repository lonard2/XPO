import { describe, it, expect } from "vitest";
import {
  auditHardcodedUi,
  auditUntranslatedValues,
} from "../../../scripts/lib/i18n-audit";
import baseline from "../../../scripts/i18n-baseline.json";

describe("localization ratchet", () => {
  it("does not add hardcoded UI strings", () => {
    const result = auditHardcodedUi();
    expect(result.total).toBeLessThanOrEqual(baseline.hardcodedUi);
  });

  it("does not add English values to non-English bundles", () => {
    expect(auditUntranslatedValues().length).toBeLessThanOrEqual(
      baseline.untranslatedValues
    );
  });

  it("keeps the baseline shape", () => {
    expect(typeof baseline.hardcodedUi).toBe("number");
    expect(typeof baseline.untranslatedValues).toBe("number");
  });
});
