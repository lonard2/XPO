import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const MESSAGES = path.join(process.cwd(), "src", "messages");
const LOCALES = ["en", "id", "ja", "zh-CN", "de", "es"];

// Themed view counts that render a distinct singular string instead of the
// plural template. Each entry pairs the plural key with its singular sibling.
const THEMED_COUNT_PAIRS: Array<[string, string, string]> = [
  ["POP_CULTURE_GAMING", "badgesLeft", "badgesLeftOne"],
  ["TECH_DEV_SUMMIT", "availableCount", "availableCountOne"],
  ["MEGA_EXPO_PAVILION", "brandsCount", "brandsCountOne"],
  ["MEGA_EXPO_PAVILION", "availableCount", "availableCountOne"],
  ["MEDICAL_SYMPOSIUM", "abstractsCta", "abstractsCtaOne"],
  ["MEDICAL_SYMPOSIUM", "cmeCreditsBadge", "cmeCreditsBadgeOne"],
  ["MEDICAL_SYMPOSIUM", "badgesLeft", "badgesLeftOne"],
  ["GOVERNMENT_DIPLOMATIC", "delegationsCta", "delegationsCtaOne"],
  ["GOVERNMENT_DIPLOMATIC", "credentialsLeft", "credentialsLeftOne"],
  ["INCENTIVE_RETREAT", "itineraryCta", "itineraryCtaOne"],
  ["INCENTIVE_RETREAT", "suitesRemaining", "suitesRemainingOne"],
  ["INDUSTRIAL_B2B", "browseCta", "browseCtaOne"],
  ["INDUSTRIAL_B2B", "passesLeft", "passesLeftOne"],
];

describe("Count copy", () => {
  it("provides a singular message for every count that can be one", () => {
    for (const locale of LOCALES) {
      const bundle = JSON.parse(
        fs.readFileSync(path.join(MESSAGES, `${locale}.json`), "utf8")
      );

      expect({
        locale,
        missing: !bundle.discovery?.selectedCountOne,
      }).toEqual({ locale, missing: false });
      expect({
        locale,
        missing: !bundle.tickets?.onlyRemainingOne,
      }).toEqual({ locale, missing: false });
    }
  });

  it("provides a singular sibling for every themed view count", () => {
    for (const locale of LOCALES) {
      const bundle = JSON.parse(
        fs.readFileSync(path.join(MESSAGES, `${locale}.json`), "utf8")
      );

      for (const [view, pluralKey, singularKey] of THEMED_COUNT_PAIRS) {
        const namespace = bundle.archetypeViews?.[view];
        expect({
          locale,
          view,
          missingPlural: !namespace?.[pluralKey],
        }).toEqual({ locale, view, missingPlural: false });
        expect({
          locale,
          view,
          missingSingular: !namespace?.[singularKey],
        }).toEqual({ locale, view, missingSingular: false });
        expect({
          locale,
          view,
          identical: namespace?.[singularKey] === namespace?.[pluralKey],
        }).toEqual({ locale, view, identical: false });
      }
    }
  });
});
