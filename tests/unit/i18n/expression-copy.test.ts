import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const MESSAGES = path.join(process.cwd(), "src", "messages");
const LOCALES = ["en", "id", "ja", "zh-CN", "de", "es"];

// Strings that previously lived inside JSX expressions, where the AST audit
// cannot see them: drawer submit states, tier fallbacks, filter sentinels, and
// track fallbacks. Each entry must resolve in every locale.
const EXPRESSION_KEYS: Array<[string, string]> = [
  ["FINANCE_INVESTOR", "kycVerifiedCode"],
  ["FINANCE_INVESTOR", "kycPendingCode"],
  ["FINANCE_INVESTOR", "defaultTrack"],
  ["FINANCE_INVESTOR", "complimentaryObserver"],
  ["FINANCE_INVESTOR", "standardTier"],
  ["FINANCE_INVESTOR", "dealRoomDefault"],
  ["FINANCE_INVESTOR", "submitting"],
  ["FINANCE_INVESTOR", "submitCta"],
  ["GOVERNMENT_DIPLOMATIC", "defaultTrack"],
  ["GOVERNMENT_DIPLOMATIC", "officialDelegationPass"],
  ["GOVERNMENT_DIPLOMATIC", "submitting"],
  ["GOVERNMENT_DIPLOMATIC", "submitCta"],
  ["INDUSTRIAL_B2B", "generalIndustry"],
  ["INDUSTRIAL_B2B", "defaultTrack"],
  ["INDUSTRIAL_B2B", "submitting"],
  ["INDUSTRIAL_B2B", "submitCta"],
  ["INDUSTRIAL_B2B", "filterAll"],
  ["MEDICAL_SYMPOSIUM", "defaultTrack"],
  ["TECH_DEV_SUMMIT", "filterAll"],
  ["AUTOMOTIVE_MOBILITY", "filterAll"],
  ["AUTOMOTIVE_MOBILITY", "powertrainHybrid"],
  ["MUSIC_FESTIVAL", "filterAll"],
];

describe("Expression copy", () => {
  it("resolves every expression string in all locales", () => {
    for (const locale of LOCALES) {
      const bundle = JSON.parse(
        fs.readFileSync(path.join(MESSAGES, `${locale}.json`), "utf8")
      );

      for (const [view, key] of EXPRESSION_KEYS) {
        const value = bundle.archetypeViews?.[view]?.[key];
        expect({ locale, view, key, missing: !value }).toEqual({
          locale,
          view,
          key,
          missing: false,
        });
      }
    }
  });

  it("keeps expression copy free of em dashes and emoji", () => {
    for (const locale of LOCALES) {
      const bundle = JSON.parse(
        fs.readFileSync(path.join(MESSAGES, `${locale}.json`), "utf8")
      );

      for (const [view, key] of EXPRESSION_KEYS) {
        const value: string = bundle.archetypeViews[view][key];
        expect({ locale, view, key, emDash: value.includes("\u2014") }).toEqual({
          locale,
          view,
          key,
          emDash: false,
        });
        expect({
          locale,
          view,
          key,
          emoji: /\p{Extended_Pictographic}/u.test(value),
        }).toEqual({ locale, view, key, emoji: false });
      }
    }
  });
});
