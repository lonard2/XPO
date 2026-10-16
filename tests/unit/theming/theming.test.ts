import { describe, it, expect } from "vitest";
import {
  getArchetypeTokens,
  getArchetypeCssVariables,
  parseBrandingConfig,
  isValidArchetype,
  getContrastRatio,
  getContrastTextColor,
  getReadableBadgeColors,
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

  it("T1.1: resolves distinct default theme tokens for all 22 MICE archetypes", () => {
    expect(ARCHETYPE_LIST).toHaveLength(22);
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

describe("Contrast helpers for arbitrary colour surfaces", () => {
  it("computes known WCAG ratios", () => {
    expect(getContrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 1);
    expect(getContrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 2);
  });

  it("returns 1 rather than NaN for unparseable colours", () => {
    expect(getContrastRatio("not-a-colour", "#ffffff")).toBe(1);
    expect(getContrastRatio("#ffffff", "")).toBe(1);
    expect(getContrastRatio("#fff", "rgb(0,0,0)")).toBe(1);
  });

  it("accepts three digit hex", () => {
    expect(getContrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
  });

  it("picks light ink for a dark surface and dark ink for a light surface", () => {
    expect(getContrastTextColor("#0f172a")).toBe("#ffffff");
    expect(getContrastTextColor("#fde68a")).toBe("#0f172a");
  });

  it("picks dark ink for amber, which white text fails on", () => {
    // Regression: the MEGA_EXPO badge hardcoded white over #ea580c (3.6:1).
    expect(getContrastTextColor("#ea580c")).toBe("#0f172a");
    expect(getContrastRatio("#ffffff", "#ea580c")).toBeLessThan(4.5);
  });

  it("picks light ink for indigo, which dark text fails on", () => {
    // Regression: the luminance threshold returned dark ink over #6366f1 (3.6:1).
    expect(getContrastTextColor("#6366f1")).toBe("#ffffff");
    expect(getContrastRatio("#0f172a", "#6366f1")).toBeLessThan(4.5);
  });

  it("always returns the better of the two inks for any archetype primary", () => {
    for (const archetype of ARCHETYPE_LIST) {
      const { primary } = ARCHETYPE_DEFAULTS[archetype];
      const chosen = getContrastTextColor(primary);
      const other = chosen === "#ffffff" ? "#0f172a" : "#ffffff";

      expect(["#ffffff", "#0f172a"]).toContain(chosen);
      expect(getContrastRatio(chosen, primary)).toBeGreaterThanOrEqual(
        getContrastRatio(other, primary)
      );
    }
  });

  it("brings every archetype badge to at least 4.5:1", () => {
    for (const archetype of ARCHETYPE_LIST) {
      const { primary } = ARCHETYPE_DEFAULTS[archetype];
      const badge = getReadableBadgeColors(primary);

      expect(getContrastRatio(badge.color, badge.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps the archetype hue recognisable instead of replacing it", () => {
    // #6366f1 only reaches 4.47:1 with white, so it must darken rather than become neutral.
    const badge = getReadableBadgeColors("#6366f1");
    const channels = {
      r: parseInt(badge.background.slice(1, 3), 16),
      g: parseInt(badge.background.slice(3, 5), 16),
      b: parseInt(badge.background.slice(5, 7), 16),
    };

    expect(badge.color).toBe("#ffffff");
    expect(badge.background).not.toBe("#6366f1");
    expect(getContrastRatio(badge.color, badge.background)).toBeGreaterThanOrEqual(4.5);
    // Still the same blue-dominant hue, not a neutral grey.
    expect(channels.b).toBeGreaterThan(channels.r);
    expect(channels.b).toBeGreaterThan(channels.g);
  });

  it("leaves a background alone when it already passes", () => {
    expect(getReadableBadgeColors("#ea580c").background).toBe("#ea580c");
    expect(getReadableBadgeColors("#0f172a").background).toBe("#0f172a");
  });

  it("honours a custom minimum ratio", () => {
    const badge = getReadableBadgeColors("#6366f1", 4.4);
    expect(getContrastRatio(badge.color, badge.background)).toBeGreaterThanOrEqual(4.4);
  });

  it("does not throw on an invalid background", () => {
    expect(() => getReadableBadgeColors("nope")).not.toThrow();
    expect(getReadableBadgeColors("nope").color).toBe("#ffffff");
  });

  it("falls back to light ink for missing or invalid input", () => {
    expect(getContrastTextColor()).toBe("#ffffff");
    expect(getContrastTextColor(null)).toBe("#ffffff");
    expect(getContrastTextColor("")).toBe("#ffffff");
    expect(getContrastTextColor("rebeccapurple")).toBe("#ffffff");
  });

  it("handles organizer brand overrides that are arbitrary hex", () => {
    const tokens = getArchetypeTokens("INDUSTRIAL_B2B", { primaryColor: "#fff8dc" });
    expect(tokens.primary).toBe("#fff8dc");
    expect(getContrastTextColor(tokens.primary)).toBe("#0f172a");
  });
});
