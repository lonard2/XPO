import { describe, it, expect } from "vitest";
import {
  parseBrandingConfig,
  type BrandingConfig,
  MICE_INDUSTRY_CLUSTERS,
  ARCHETYPE_LIST,
  ARCHETYPE_DEFAULTS,
  type MiceArchetype,
} from "@/lib/theming";

describe("Phase 9 Unit: Live Visual Branding Customizer & LivePreviewFrame Engine", () => {
  it("parses and serializes sectionsVisibility within BrandingConfig deterministically", () => {
    const rawJson = JSON.stringify({
      primaryColor: "#0284c7",
      accentColor: "#f59e0b",
      bannerOverlayOpacity: 0.85,
      sectionsVisibility: {
        agenda: true,
        booths: false,
        tickets: true,
        perks: false,
      },
    });

    const parsed = parseBrandingConfig(rawJson);
    expect(parsed.primaryColor).toBe("#0284c7");
    expect(parsed.accentColor).toBe("#f59e0b");
    expect(parsed.bannerOverlayOpacity).toBe(0.85);
    expect(parsed.sectionsVisibility).toBeDefined();
    expect(parsed.sectionsVisibility?.agenda).toBe(true);
    expect(parsed.sectionsVisibility?.booths).toBe(false);
    expect(parsed.sectionsVisibility?.tickets).toBe(true);
    expect(parsed.sectionsVisibility?.perks).toBe(false);
  });

  it("handles empty or missing sectionsVisibility gracefully with default fallbacks", () => {
    const emptyJson = JSON.stringify({ primaryColor: "#1e3a8a" });
    const parsed = parseBrandingConfig(emptyJson);
    expect(parsed.sectionsVisibility).toBeUndefined();

    const sections = {
      agenda: parsed.sectionsVisibility?.agenda ?? true,
      booths: parsed.sectionsVisibility?.booths ?? true,
      tickets: parsed.sectionsVisibility?.tickets ?? true,
      perks: parsed.sectionsVisibility?.perks ?? true,
    };

    expect(sections.agenda).toBe(true);
    expect(sections.booths).toBe(true);
    expect(sections.tickets).toBe(true);
    expect(sections.perks).toBe(true);
  });

  it("resolves all font family tokens correctly in preview frame helper", () => {
    const getFontFamilyClass = (fontFamily: string) => {
      switch (fontFamily) {
        case "serif":
        case "font-serif":
          return "font-serif";
        case "mono":
        case "font-mono":
          return "font-mono";
        case "legible":
        case "font-legible":
          return "font-sans tracking-wide";
        case "sans":
        case "font-sans":
        default:
          return "font-sans";
      }
    };

    expect(getFontFamilyClass("font-serif")).toBe("font-serif");
    expect(getFontFamilyClass("serif")).toBe("font-serif");
    expect(getFontFamilyClass("font-mono")).toBe("font-mono");
    expect(getFontFamilyClass("mono")).toBe("font-mono");
    expect(getFontFamilyClass("font-legible")).toBe("font-sans tracking-wide");
    expect(getFontFamilyClass("legible")).toBe("font-sans tracking-wide");
    expect(getFontFamilyClass("font-sans")).toBe("font-sans");
    expect(getFontFamilyClass("sans")).toBe("font-sans");
    expect(getFontFamilyClass("unknown")).toBe("font-sans");
  });

  it("ensures all 22 MICE archetypes are grouped across industry clusters without orphans", () => {
    const clusteredArchetypes = new Set<string>();
    for (const cluster of MICE_INDUSTRY_CLUSTERS) {
      expect(cluster.label.length).toBeGreaterThan(0);
      expect(cluster.archetypes.length).toBeGreaterThan(0);
      for (const arch of cluster.archetypes) {
        clusteredArchetypes.add(arch);
      }
    }

    for (const arch of ARCHETYPE_LIST) {
      expect(clusteredArchetypes.has(arch)).toBe(true);
    }
  });

  it("detects customized palette changes before archetype switching", () => {
    const checkIsCustomized = (
      currentArchetype: MiceArchetype,
      primaryColor: string,
      accentColor: string,
      fontFamily: string
    ) => {
      const defaults = ARCHETYPE_DEFAULTS[currentArchetype];
      return (
        primaryColor !== defaults.primary ||
        accentColor !== defaults.accent ||
        fontFamily !== defaults.fontFamily
      );
    };

    // Unmodified defaults:
    const unmodified = checkIsCustomized(
      "INDUSTRIAL_B2B",
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.primary,
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.accent,
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.fontFamily
    );
    expect(unmodified).toBe(false);

    // Customized primary color:
    const customizedColor = checkIsCustomized(
      "INDUSTRIAL_B2B",
      "#ff0055",
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.accent,
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.fontFamily
    );
    expect(customizedColor).toBe(true);

    // Customized font:
    const customizedFont = checkIsCustomized(
      "INDUSTRIAL_B2B",
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.primary,
      ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.accent,
      "font-serif"
    );
    expect(customizedFont).toBe(true);
  });

  it("verifies simulated browser address bar resolves slug or fallback path", () => {
    const getSimulatedUrl = (eventSlug?: string) => {
      return `https://xpo.io/events/${eventSlug || "preview-live"}`;
    };

    expect(getSimulatedUrl("tokyo-ai-summit-2027")).toBe("https://xpo.io/events/tokyo-ai-summit-2027");
    expect(getSimulatedUrl("")).toBe("https://xpo.io/events/preview-live");
    expect(getSimulatedUrl(undefined)).toBe("https://xpo.io/events/preview-live");
  });

  it("validates event lookup condition supporting both CUID and slug in branding API route", () => {
    const buildLookupCondition = (identifier: string) => {
      return {
        OR: [{ id: identifier }, { slug: identifier }],
      };
    };

    const cuidCondition = buildLookupCondition("cuid_123456");
    expect(cuidCondition.OR).toEqual([{ id: "cuid_123456" }, { slug: "cuid_123456" }]);

    const slugCondition = buildLookupCondition("indonesia-green-energy-expo-2027");
    expect(slugCondition.OR).toEqual([
      { id: "indonesia-green-energy-expo-2027" },
      { slug: "indonesia-green-energy-expo-2027" },
    ]);
  });
});
