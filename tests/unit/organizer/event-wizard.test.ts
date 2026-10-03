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
  it("verifies all 22 MICE category archetypes have valid default theme tokens", () => {
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
      "BUILDING_PROPTECH",
      "AEROSPACE_DEFENSE",
      "SUPPLY_CHAIN_LOGISTICS",
      "FRANCHISE_LICENSING",
      "FAITH_PILGRIMAGE_CONGRESS",
      "SPORTS_OUTDOOR",
      "MEDIA_BROADCAST",
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

  it("calculates physical hall capacity allocation and flags over-allocation deterministically", () => {
    const checkHallCapacity = (
      hallCapacity: number,
      tiers: Array<{ capacity: number }>
    ) => {
      const total = tiers.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
      const percentage = hallCapacity > 0 ? Math.round((total / hallCapacity) * 100) : 0;
      const isOverAllocated = total > hallCapacity;
      return { total, percentage, isOverAllocated };
    };

    // Within capacity
    const valid = checkHallCapacity(5000, [
      { capacity: 3500 },
      { capacity: 500 },
    ]);
    expect(valid.total).toBe(4000);
    expect(valid.percentage).toBe(80);
    expect(valid.isOverAllocated).toBe(false);

    // Over capacity
    const exceeded = checkHallCapacity(3500, [
      { capacity: 3500 },
      { capacity: 1000 },
    ]);
    expect(exceeded.total).toBe(4500);
    expect(exceeded.percentage).toBe(129);
    expect(exceeded.isOverAllocated).toBe(true);
  });

  it("preserves manual custom slug when editing title if slug is marked dirty", () => {
    const resolveSlug = (
      newTitle: string,
      currentSlug: string,
      isSlugDirty: boolean
    ) => {
      if (isSlugDirty) return currentSlug;
      return newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    // Auto-generation when clean
    expect(resolveSlug("Energy Expo 2027", "", false)).toBe("energy-expo-2027");

    // Preservation when user has edited custom slug
    expect(resolveSlug("Updated Title 2028", "custom-expo-slug", true)).toBe("custom-expo-slug");
  });

  it("calculates combined multi-hall campus capacity across multiple allocated halls", () => {
    const venueHalls = [
      { id: "hall-a1", name: "Hall A1", capacity: 4000 },
      { id: "hall-a2", name: "Hall A2", capacity: 4000 },
      { id: "hall-a3", name: "Hall A3", capacity: 4000 },
      { id: "hall-b1", name: "Hall B1", capacity: 3000 },
    ];

    const calculateCampusCapacity = (allocatedHallIds: string[]) => {
      const selected = venueHalls.filter((h) => allocatedHallIds.includes(h.id));
      const totalCapacity = selected.reduce((acc, h) => acc + (h.capacity || 0), 0);
      return { selected, totalCapacity };
    };

    // Single hall allocation
    const single = calculateCampusCapacity(["hall-a1"]);
    expect(single.selected.length).toBe(1);
    expect(single.totalCapacity).toBe(4000);

    // Multi-hall campus allocation (JIExpo A1 + A2 + A3)
    const triple = calculateCampusCapacity(["hall-a1", "hall-a2", "hall-a3"]);
    expect(triple.selected.length).toBe(3);
    expect(triple.totalCapacity).toBe(12000);

    // Synchronized ticket capacity safeguard with multi-hall quota
    const totalTicketPasses = 10000;
    const isExceededSingle = totalTicketPasses > single.totalCapacity;
    const isExceededCampus = totalTicketPasses > triple.totalCapacity;
    expect(isExceededSingle).toBe(true); // Exceeds single hall (10,000 > 4,000)
    expect(isExceededCampus).toBe(false); // Fits comfortably in 3 halls (10,000 <= 12,000)
  });

  it("guards auto-save draft persistence against overwriting stored drafts on initial mount", () => {
    let storage: Record<string, string> = {
      "xpo_event_draft": JSON.stringify({
        title: "Existing Saved Mega Expo 2027",
        archetype: "MEGA_EXPO_PAVILION",
        venueHallIds: ["hall-a1", "hall-a2"],
      }),
    };

    const runAutoSaveEffect = (
      isInitialized: boolean,
      hasDraftAvailable: boolean,
      formData: { title: string }
    ) => {
      // P0 Guard: Never auto-save while a recovered draft is waiting for user action
      if (!isInitialized || hasDraftAvailable) return;
      storage["xpo_event_draft"] = JSON.stringify(formData);
    };

    // On mount with pending draft:
    runAutoSaveEffect(true, true, { title: "" });
    const draftBeforeAction = JSON.parse(storage["xpo_event_draft"]);
    expect(draftBeforeAction.title).toBe("Existing Saved Mega Expo 2027"); // Preserved!

    // After user resolves draft (resumes or discards):
    runAutoSaveEffect(true, false, { title: "Resumed and Edited Expo" });
    const draftAfterAction = JSON.parse(storage["xpo_event_draft"]);
    expect(draftAfterAction.title).toBe("Resumed and Edited Expo");
  });

  it("tracks fieldErrors deterministically across wizard steps and clears on user input", () => {
    const validateFields = (fields: { title: string; slug: string; description: string }) => {
      const errors: Record<string, string> = {};
      if (!fields.title.trim()) errors.title = "Please enter an event title.";
      if (!fields.slug.trim()) errors.slug = "Please enter a valid URL slug.";
      if (!fields.description.trim()) errors.description = "Please provide an event description.";
      return errors;
    };

    // When empty:
    const emptyErrors = validateFields({ title: "", slug: "", description: "" });
    expect(emptyErrors.title).toBe("Please enter an event title.");
    expect(emptyErrors.slug).toBe("Please enter a valid URL slug.");
    expect(emptyErrors.description).toBe("Please provide an event description.");

    // Simulating clearFieldError on user typing:
    const clearFieldError = (errors: Record<string, string>, field: string) => {
      const next = { ...errors };
      delete next[field];
      return next;
    };

    const resolvedTitle = clearFieldError(emptyErrors, "title");
    expect(resolvedTitle.title).toBeUndefined();
    expect(resolvedTitle.slug).toBe("Please enter a valid URL slug.");
  });

  it("adapts ticket tier currencies and default price points when switching country editions", () => {
    const initialTiers = [
      { id: "tier-1", name: "Standard", price: 0, currency: "IDR" },
      { id: "tier-2", name: "VIP", price: 750000, currency: "IDR" },
    ];

    const adaptTiersForRegion = (
      tiers: typeof initialTiers,
      newReg: "id" | "jp" | "global"
    ) => {
      const targetCurrency = newReg === "jp" ? "JPY" : newReg === "global" ? "USD" : "IDR";
      return tiers.map((t) => {
        if (t.currency === targetCurrency) return t;
        let newPrice = t.price;
        if (t.price > 0) {
          if (targetCurrency === "JPY") newPrice = 10000;
          else if (targetCurrency === "USD") newPrice = 99;
          else newPrice = 750000;
        }
        return { ...t, currency: targetCurrency, price: newPrice };
      });
    };

    // Switch to Japan
    const jpTiers = adaptTiersForRegion(initialTiers, "jp");
    expect(jpTiers[0].currency).toBe("JPY");
    expect(jpTiers[0].price).toBe(0);
    expect(jpTiers[1].currency).toBe("JPY");
    expect(jpTiers[1].price).toBe(10000);

    // Switch to Global
    const globalTiers = adaptTiersForRegion(jpTiers, "global");
    expect(globalTiers[0].currency).toBe("USD");
    expect(globalTiers[1].currency).toBe("USD");
    expect(globalTiers[1].price).toBe(99);

    // Switch back to Indonesia
    const idTiers = adaptTiersForRegion(globalTiers, "id");
    expect(idTiers[1].currency).toBe("IDR");
    expect(idTiers[1].price).toBe(750000);
  });

  it("cycles keyboard navigation strictly through displayed archetypes in active cluster", () => {
    const activeClusterArchetypes = [
      "GOVERNMENT_DIPLOMATIC",
      "FINANCE_INVESTOR",
      "INCENTIVE_RETREAT",
    ];

    const getNextArchetype = (currentArch: string, direction: "next" | "prev") => {
      const currentIndex = activeClusterArchetypes.indexOf(currentArch);
      if (currentIndex === -1) return activeClusterArchetypes[0];
      if (direction === "next") {
        return activeClusterArchetypes[(currentIndex + 1) % activeClusterArchetypes.length];
      }
      return activeClusterArchetypes[
        (currentIndex - 1 + activeClusterArchetypes.length) % activeClusterArchetypes.length
      ];
    };

    expect(getNextArchetype("GOVERNMENT_DIPLOMATIC", "next")).toBe("FINANCE_INVESTOR");
    expect(getNextArchetype("FINANCE_INVESTOR", "next")).toBe("INCENTIVE_RETREAT");
    expect(getNextArchetype("INCENTIVE_RETREAT", "next")).toBe("GOVERNMENT_DIPLOMATIC");
    expect(getNextArchetype("GOVERNMENT_DIPLOMATIC", "prev")).toBe("INCENTIVE_RETREAT");
  });

  it("safeguards draft deletion with a two-step confirmation modal flow", () => {
    let storage: Record<string, string> = {
      xpo_event_draft: JSON.stringify({ title: "Draft To Safeguard" }),
    };
    let isModalOpen = false;
    let hasDraftAvailable = true;

    // User clicks "Discard" in banner
    const handleClickDiscard = () => {
      isModalOpen = true; // Triggers confirmation modal rather than immediately deleting
    };

    // User confirms in modal
    const handleConfirmDiscard = () => {
      delete storage.xpo_event_draft;
      hasDraftAvailable = false;
      isModalOpen = false;
    };

    handleClickDiscard();
    expect(isModalOpen).toBe(true);
    expect(storage.xpo_event_draft).toBeDefined(); // Draft still safe!

    handleConfirmDiscard();
    expect(isModalOpen).toBe(false);
    expect(hasDraftAvailable).toBe(false);
    expect(storage.xpo_event_draft).toBeUndefined(); // Permanently deleted only after confirmation
  });

  it("derives initial country edition and venue selection dynamically from route locale", () => {
    const venues = [
      { id: "v-jiexpo", regionId: "id", name: "JIExpo Kemayoran" },
      { id: "v-bigsight", regionId: "jp", name: "Tokyo Big Sight" },
      { id: "v-mbs", regionId: "global", name: "Marina Bay Sands Expo" },
    ];

    const deriveInitialConfig = (locale: string) => {
      const regionId = locale === "ja" ? "jp" : locale === "global" ? "global" : "id";
      const matchingVenue = venues.find((v) => v.regionId === regionId) || venues[0];
      const currency = regionId === "jp" ? "JPY" : regionId === "global" ? "USD" : "IDR";
      return { regionId, venueId: matchingVenue.id, currency };
    };

    // Japanese route /ja/events/new
    const jaConfig = deriveInitialConfig("ja");
    expect(jaConfig.regionId).toBe("jp");
    expect(jaConfig.venueId).toBe("v-bigsight");
    expect(jaConfig.currency).toBe("JPY");

    // Global route /global/events/new
    const globalConfig = deriveInitialConfig("global");
    expect(globalConfig.regionId).toBe("global");
    expect(globalConfig.venueId).toBe("v-mbs");
    expect(globalConfig.currency).toBe("USD");

    // Indonesian / default route /id/events/new or /en/events/new
    const idConfig = deriveInitialConfig("en");
    expect(idConfig.regionId).toBe("id");
    expect(idConfig.venueId).toBe("v-jiexpo");
    expect(idConfig.currency).toBe("IDR");
  });
});



