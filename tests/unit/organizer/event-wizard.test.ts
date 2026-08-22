import { describe, it, expect } from "vitest";
import {
  ARCHETYPE_DEFAULTS,
  ARCHETYPE_METADATA,
  MiceArchetype,
  getArchetypeTokens,
  getArchetypeCssVariables,
  parseBrandingConfig,
} from "@/lib/theming";

describe("Phase 9 Unit: Event Creation Wizard & Archetype Engine", () => {
  it("verifies all 15 MICE category archetypes have valid default theme tokens", () => {
    const archetypes: MiceArchetype[] = [
      "INDUSTRIAL_B2B",
      "TECH_DEV_SUMMIT",
      "MEDICAL_SYMPOSIUM",
      "FINANCE_INVESTOR",
      "POP_CULTURE_GAMING",
      "MUSIC_FESTIVAL",
      "MEGA_EXPO_PAVILION",
      "GOVERNMENT_DIPLOMATIC",
      "INCENTIVE_RETREAT",
      "AUTOMOTIVE_MOBILITY",
      "ENERGY_INFRASTRUCTURE",
      "AGRITECH_FOOD",
      "HOSPITALITY_TOURISM",
      "EDUCATION_EDTECH",
      "FASHION_RETAIL",
    ];

    for (const arch of archetypes) {
      const tokens = ARCHETYPE_DEFAULTS[arch];
      expect(tokens).toBeDefined();
      expect(tokens.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tokens.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tokens.displayName).toBeDefined();
      expect(tokens.fontFamily).toBeDefined();
    }
  });

  it("generates CSS variable mappings for runtime theme injection", () => {
    const cssVars = getArchetypeCssVariables("TECH_DEV_SUMMIT");
    expect(cssVars["--archetype-primary"]).toBe("#6366f1");
    expect(cssVars["--archetype-accent"]).toBe("#06b6d4");
    expect(cssVars["--archetype-bg"]).toBeDefined();
    expect(cssVars["--archetype-surface"]).toBeDefined();
  });

  it("applies organizer branding overrides on top of archetype defaults", () => {
    const overridden = getArchetypeTokens("ENERGY_INFRASTRUCTURE", {
      primaryColor: "#0284c7",
      accentColor: "#f59e0b",
      fontFamilyOverride: "font-serif",
    });

    expect(overridden.primary).toBe("#0284c7");
    expect(overridden.accent).toBe("#f59e0b");
    expect(overridden.fontFamily).toBe("font-serif");
  });

  it("safely parses branding configuration JSON strings without throwing", () => {
    const validJson = JSON.stringify({
      primaryColor: "#1e3a8a",
      accentColor: "#d97706",
      heroBadge: "Official Expo",
      bannerOverlayOpacity: 0.85,
    });

    const parsed = parseBrandingConfig(validJson);
    expect(parsed.primaryColor).toBe("#1e3a8a");
    expect(parsed.accentColor).toBe("#d97706");
    expect(parsed.heroBadge).toBe("Official Expo");
    expect(parsed.bannerOverlayOpacity).toBe(0.85);

    // Malformed JSON handling
    expect(parseBrandingConfig("not-json")).toEqual({});
    expect(parseBrandingConfig(null)).toEqual({});
    expect(parseBrandingConfig(undefined)).toEqual({});
  });
});
