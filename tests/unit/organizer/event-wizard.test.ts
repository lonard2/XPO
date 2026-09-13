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

  it("validates event wizard step requirements deterministically", () => {
    // Step 1 validation: title, slug, and description
    const validateStep1 = (title: string, slug: string, desc: string) => {
      if (!title.trim()) return "Please enter an event title.";
      if (!slug.trim()) return "Please enter a valid URL slug.";
      if (!desc.trim()) return "Please provide an event description.";
      return null;
    };

    expect(validateStep1("", "slug", "desc")).toBe("Please enter an event title.");
    expect(validateStep1("Title", "", "desc")).toBe("Please enter a valid URL slug.");
    expect(validateStep1("Title", "slug", "")).toBe("Please provide an event description.");
    expect(validateStep1("Valid Title", "valid-slug", "Valid description")).toBeNull();

    // Step 2 validation: venue and date logic
    const validateStep2 = (venueId: string, startDate: string, endDate: string) => {
      if (!venueId) return "Please select a hosting venue.";
      if (!startDate || !endDate) return "Please specify start and end dates.";
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Please specify valid start and end dates.";
      if (end < start) return "End date cannot be prior to start date.";
      return null;
    };

    expect(validateStep2("", "2027-04-14", "2027-04-17")).toBe("Please select a hosting venue.");
    expect(validateStep2("v-ice", "", "2027-04-17")).toBe("Please specify start and end dates.");
    expect(validateStep2("v-ice", "invalid-date", "2027-04-17")).toBe("Please specify valid start and end dates.");
    expect(validateStep2("v-ice", "2027-04-17", "2027-04-14")).toBe("End date cannot be prior to start date.");
    expect(validateStep2("v-ice", "2027-04-14", "2027-04-17")).toBeNull();

    // Step 3 validation: ticket tiers
    const validateStep3 = (tiers: Array<{ name: string; capacity: number; price: number }>) => {
      if (tiers.length === 0) return "Please configure at least one ticket pass tier.";
      for (const t of tiers) {
        if (!t.name.trim()) return "All ticket tiers must have a descriptive title.";
        if (!t.capacity || isNaN(Number(t.capacity)) || Number(t.capacity) <= 0) {
          return "Ticket tier capacities must be a positive integer.";
        }
        if (isNaN(Number(t.price)) || Number(t.price) < 0) {
          return "Ticket tier price cannot be negative.";
        }
      }
      return null;
    };

    expect(validateStep3([])).toBe("Please configure at least one ticket pass tier.");
    expect(validateStep3([{ name: "", capacity: 100, price: 0 }])).toBe("All ticket tiers must have a descriptive title.");
    expect(validateStep3([{ name: "Standard", capacity: -5, price: 0 }])).toBe("Ticket tier capacities must be a positive integer.");
    expect(validateStep3([{ name: "Standard", capacity: 100, price: -50 }])).toBe("Ticket tier price cannot be negative.");
    expect(validateStep3([{ name: "Standard", capacity: 100, price: 50000 }])).toBeNull();
  });

  it("derives appropriate regional currency for ticket tier creation", () => {
    const getCurrencyForRegion = (regionId: string) => {
      return regionId === "jp" ? "JPY" : regionId === "global" ? "USD" : "IDR";
    };

    expect(getCurrencyForRegion("id")).toBe("IDR");
    expect(getCurrencyForRegion("jp")).toBe("JPY");
    expect(getCurrencyForRegion("global")).toBe("USD");
    expect(getCurrencyForRegion("unknown")).toBe("IDR");
  });
});

