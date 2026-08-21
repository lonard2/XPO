import { describe, it, expect } from "vitest";
import {
  getArchetypeTokens,
  getArchetypeCssVariables,
  parseBrandingConfig,
  isValidArchetype,
  ARCHETYPE_DEFAULTS,
  ARCHETYPE_LIST,
  ARCHETYPE_METAS,
  type MiceArchetype,
  type BrandingConfig,
} from "@/lib/theming";

describe("Phase 5 Unit: Dynamic MICE Category Theming Engine", () => {
  const allArchetypes: MiceArchetype[] = ARCHETYPE_LIST;

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (Core Token & CSS Var Resolution)
  // ==========================================================================

  it("T1.1: resolves distinct default theme tokens for all 15 MICE archetypes", () => {
    expect(ARCHETYPE_LIST).toHaveLength(15);
    for (const archetype of allArchetypes) {
      const tokens = getArchetypeTokens(archetype);
      expect(tokens.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tokens.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tokens.background).toBeDefined();
      expect(tokens.surface).toBeDefined();
      expect(tokens.border).toBeDefined();
      expect(tokens.fontFamily).toMatch(/^font-(sans|serif|mono|legible)$/);
      expect(tokens.badgeStyle).toBeDefined();
    }
  });

  it("T1.2: verifies specialized typography pairings for domain archetypes", () => {
    expect(getArchetypeTokens("TECH_DEV_SUMMIT").fontFamily).toBe("font-mono");
    expect(getArchetypeTokens("MEDICAL_SYMPOSIUM").fontFamily).toBe("font-serif");
    expect(getArchetypeTokens("GOVERNMENT_DIPLOMATIC").fontFamily).toBe("font-serif");
    expect(getArchetypeTokens("POP_CULTURE_GAMING").fontFamily).toBe("font-legible");
    expect(getArchetypeTokens("INCENTIVE_RETREAT").fontFamily).toBe("font-legible");
    expect(getArchetypeTokens("INDUSTRIAL_B2B").fontFamily).toBe("font-sans");
    expect(getArchetypeTokens("FINANCE_INVESTOR").fontFamily).toBe("font-sans");
    expect(getArchetypeTokens("MUSIC_FESTIVAL").fontFamily).toBe("font-sans");
    expect(getArchetypeTokens("MEGA_EXPO_PAVILION").fontFamily).toBe("font-sans");
  });

  it("T1.3: generates comprehensive CSS custom property mapping for dynamic injection", () => {
    const cssVars = getArchetypeCssVariables("MEGA_EXPO_PAVILION");

    expect(cssVars["--archetype-primary"]).toBe(ARCHETYPE_DEFAULTS.MEGA_EXPO_PAVILION.primary);
    expect(cssVars["--archetype-accent"]).toBe(ARCHETYPE_DEFAULTS.MEGA_EXPO_PAVILION.accent);
    expect(cssVars["--archetype-bg"]).toBe(ARCHETYPE_DEFAULTS.MEGA_EXPO_PAVILION.background);
    expect(cssVars["--archetype-surface"]).toBe(ARCHETYPE_DEFAULTS.MEGA_EXPO_PAVILION.surface);
    expect(cssVars["--archetype-border"]).toBe(ARCHETYPE_DEFAULTS.MEGA_EXPO_PAVILION.border);
  });

  it("T1.4: applies organizer custom branding color overrides seamlessly", () => {
    const overrides: BrandingConfig = {
      primaryColor: "#ff0055",
      accentColor: "#00ffcc",
    };

    const tokens = getArchetypeTokens("TECH_DEV_SUMMIT", overrides);
    expect(tokens.primary).toBe("#ff0055");
    expect(tokens.accent).toBe("#00ffcc");
    // Background and typography should remain faithful to the archetype default
    expect(tokens.background).toBe(ARCHETYPE_DEFAULTS.TECH_DEV_SUMMIT.background);
    expect(tokens.fontFamily).toBe("font-mono");
  });

  it("T1.5: updates CSS variable dictionary when branding overrides are applied", () => {
    const overrides: BrandingConfig = {
      primaryColor: "#0284c7",
    };

    const cssVars = getArchetypeCssVariables("INDUSTRIAL_B2B", overrides);
    expect(cssVars["--archetype-primary"]).toBe("#0284c7");
    expect(cssVars["--archetype-accent"]).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.accent);
  });

  it("T1.6: verifies archetype metadata dictionary contains valid labels and icons", () => {
    for (const archetype of allArchetypes) {
      const meta = ARCHETYPE_METAS[archetype];
      expect(meta).toBeDefined();
      expect(meta.id).toBe(archetype);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
      expect(meta.industry.length).toBeGreaterThan(0);
      expect(meta.sampleEventTitle.length).toBeGreaterThan(0);
      expect(meta.accentIcon.length).toBeGreaterThan(0);
    }
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & ADVERSARIAL EDGE CASES
  // ==========================================================================

  it("T2.1 (Fallback): falls back safely to INDUSTRIAL_B2B when an unknown archetype is provided", () => {
    const unknownArchetype = "UNRECOGNIZED_CATEGORY" as MiceArchetype;
    const tokens = getArchetypeTokens(unknownArchetype);

    expect(tokens.primary).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.primary);
    expect(tokens.fontFamily).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.fontFamily);
  });

  it("T2.2 (Partial Override): preserves archetype defaults when override object contains empty or whitespace properties", () => {
    const emptyOverride: BrandingConfig = {
      primaryColor: "",
      accentColor: "   ",
    };
    const tokens = getArchetypeTokens("MUSIC_FESTIVAL", emptyOverride);

    expect(tokens.primary).toBe(ARCHETYPE_DEFAULTS.MUSIC_FESTIVAL.primary);
    expect(tokens.accent).toBe(ARCHETYPE_DEFAULTS.MUSIC_FESTIVAL.accent);
  });

  it("T2.3 (CSS Format): verifies all generated CSS variable keys follow standard kebab-case naming", () => {
    for (const archetype of allArchetypes) {
      const vars = getArchetypeCssVariables(archetype);
      for (const [key, value] of Object.entries(vars)) {
        expect(key).toMatch(/^--[a-z0-9-]+$/);
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it("T2.4 (JSON Parser): parses branding JSON safely and handles malformed strings gracefully", () => {
    const validJson = JSON.stringify({ primaryColor: "#10b981", heroBadge: "Official Expo" });
    const parsedValid = parseBrandingConfig(validJson);
    expect(parsedValid.primaryColor).toBe("#10b981");
    expect(parsedValid.heroBadge).toBe("Official Expo");

    expect(parseBrandingConfig(null)).toEqual({});
    expect(parseBrandingConfig(undefined)).toEqual({});
    expect(parseBrandingConfig("")).toEqual({});
    expect(parseBrandingConfig("not-valid-json")).toEqual({});
    expect(parseBrandingConfig("12345")).toEqual({});
  });

  it("T2.5 (Type Guard): validates isValidArchetype for valid and invalid inputs", () => {
    expect(isValidArchetype("INDUSTRIAL_B2B")).toBe(true);
    expect(isValidArchetype("TECH_DEV_SUMMIT")).toBe(true);
    expect(isValidArchetype("MEDICAL_SYMPOSIUM")).toBe(true);
    expect(isValidArchetype("FINANCE_INVESTOR")).toBe(true);
    expect(isValidArchetype("POP_CULTURE_GAMING")).toBe(true);
    expect(isValidArchetype("MUSIC_FESTIVAL")).toBe(true);
    expect(isValidArchetype("MEGA_EXPO_PAVILION")).toBe(true);
    expect(isValidArchetype("GOVERNMENT_DIPLOMATIC")).toBe(true);
    expect(isValidArchetype("INCENTIVE_RETREAT")).toBe(true);
    expect(isValidArchetype("AUTOMOTIVE_MOBILITY")).toBe(true);
    expect(isValidArchetype("ENERGY_INFRASTRUCTURE")).toBe(true);
    expect(isValidArchetype("AGRITECH_FOOD")).toBe(true);
    expect(isValidArchetype("HOSPITALITY_TOURISM")).toBe(true);
    expect(isValidArchetype("EDUCATION_EDTECH")).toBe(true);
    expect(isValidArchetype("FASHION_RETAIL")).toBe(true);

    expect(isValidArchetype("RANDOM_STRING")).toBe(false);
    expect(isValidArchetype("")).toBe(false);
    expect(isValidArchetype("industrial_b2b")).toBe(false);
  });
});
