import { describe, it, expect } from "vitest";
import {
  generateEventJsonLd,
  generatePlaceJsonLd,
  generateBreadcrumbJsonLd,
  generateMiceWebsiteJsonLd,
  getEventTypeFromArchetype,
  getAttendanceMode,
  type SeoEventInput,
  type SeoVenueInput,
} from "@/lib/seo/jsonLd";
import manifest from "@/app/manifest";

describe("Phase 12 Unit: Schema.org JSON-LD MICE Metadata & PWA Manifest", () => {
  const sampleEvent: SeoEventInput = {
    title: "IndoBuildTech Expo 2026",
    slug: "indobuildtech-expo-2026",
    description: "Southeast Asia's premier building material and architecture expo.",
    archetype: "INDUSTRIAL_B2B",
    startDate: new Date("2026-06-10T09:00:00Z"),
    endDate: new Date("2026-06-14T18:00:00Z"),
    format: "IN_PERSON",
    heroImageUrl: "https://xpo.events/images/events/indobuildtech.jpg",
    venue: {
      name: "ICE BSD City",
      city: "Tangerang",
      address: "Jl. BSD Grand Boulevard No.1",
      latitude: -6.3025,
      longitude: 106.6375,
      regionId: "id",
    },
    organizer: {
      name: "Debindo ITE",
      organization: "PT Debindo ITE International",
      websiteUrl: "https://debindo-ite.com",
    },
    ticketTiers: [
      {
        name: "Trade Visitor Pass",
        price: 0,
        currency: "IDR",
        capacity: 5000,
      },
      {
        name: "VIP Buyer Pass",
        price: 350000,
        currency: "IDR",
        capacity: 500,
      },
    ],
  };

  const sampleVenue: SeoVenueInput = {
    name: "JIExpo Kemayoran",
    slug: "jiexpo-kemayoran",
    city: "Jakarta",
    address: "Gedung Pusat Niaga Lt. 1, Arena PRJ Kemayoran",
    latitude: -6.1466,
    longitude: 106.8488,
    transitInfo: "KRL Commuter Line to Rajawali Station; TransJakarta Corridor 12.",
    imageUrl: "https://xpo.events/images/venues/jiexpo.jpg",
    regionId: "id",
    halls: [
      { name: "Hall A1", capacity: 3500, floorAreaSqm: 5000 },
      { name: "Nusantara Hall", capacity: 5000, floorAreaSqm: 7000 },
    ],
  };

  it("S1.1: generates compliant Schema.org Event JSON-LD with valid type, dates, and offers", () => {
    const jsonLd = generateEventJsonLd(sampleEvent, "https://xpo.events") as any;

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("ExhibitionEvent");
    expect(jsonLd.name).toBe("IndoBuildTech Expo 2026");
    expect(jsonLd.startDate).toBe("2026-06-10T09:00:00.000Z");
    expect(jsonLd.endDate).toBe("2026-06-14T18:00:00.000Z");
    expect(jsonLd.eventAttendanceMode).toBe("https://schema.org/OfflineEventAttendanceMode");
    expect(jsonLd.location["@type"]).toBe("Place");
    expect(jsonLd.location.name).toBe("ICE BSD City");
    expect(jsonLd.location.geo.latitude).toBe(-6.3025);
    expect(jsonLd.organizer["@type"]).toBe("Organization");
    expect(jsonLd.organizer.name).toBe("PT Debindo ITE International");

    expect(Array.isArray(jsonLd.offers)).toBe(true);
    expect(jsonLd.offers.length).toBe(2);
    expect(jsonLd.offers[0].name).toBe("Trade Visitor Pass");
    expect(jsonLd.offers[0].price).toBe(0);
    expect(jsonLd.offers[1].name).toBe("VIP Buyer Pass");
    expect(jsonLd.offers[1].price).toBe(350000);
  });

  it("S1.2: correctly maps event archetypes to schema.org event categories", () => {
    expect(getEventTypeFromArchetype("INDUSTRIAL_B2B")).toBe("ExhibitionEvent");
    expect(getEventTypeFromArchetype("MEGA_EXPO_PAVILION")).toBe("ExhibitionEvent");
    expect(getEventTypeFromArchetype("TECH_DEV_SUMMIT")).toBe("BusinessEvent");
    expect(getEventTypeFromArchetype("FINANCE_INVESTOR")).toBe("BusinessEvent");
    expect(getEventTypeFromArchetype("MEDICAL_SYMPOSIUM")).toBe("EducationEvent");
    expect(getEventTypeFromArchetype("MUSIC_FESTIVAL")).toBe("MusicEvent");
    expect(getEventTypeFromArchetype("POP_CULTURE_GAMING")).toBe("Event");
  });

  it("S1.3: correctly maps attendance modes (IN_PERSON, HYBRID, VIRTUAL)", () => {
    expect(getAttendanceMode("IN_PERSON")).toBe("https://schema.org/OfflineEventAttendanceMode");
    expect(getAttendanceMode("HYBRID")).toBe("https://schema.org/MixedEventAttendanceMode");
    expect(getAttendanceMode("VIRTUAL")).toBe("https://schema.org/OnlineEventAttendanceMode");
  });

  it("S1.4: generates Schema.org CivicStructure / Place JSON-LD with geo coordinates and halls", () => {
    const jsonLd = generatePlaceJsonLd(sampleVenue, "https://xpo.events") as any;

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("CivicStructure");
    expect(jsonLd.name).toBe("JIExpo Kemayoran");
    expect(jsonLd.address["@type"]).toBe("PostalAddress");
    expect(jsonLd.address.addressLocality).toBe("Jakarta");
    expect(jsonLd.geo.latitude).toBe(-6.1466);
    expect(jsonLd.geo.longitude).toBe(106.8488);
    expect(jsonLd.maximumAttendeeCapacity).toBe(8500);
    expect(jsonLd.hasMap).toContain("google.com/maps");

    expect(Array.isArray(jsonLd.containsPlace)).toBe(true);
    expect(jsonLd.containsPlace.length).toBe(2);
    expect(jsonLd.containsPlace[0]["@type"]).toBe("Room");
    expect(jsonLd.containsPlace[0].name).toBe("Hall A1");
  });

  it("S1.5: generates Schema.org BreadcrumbList JSON-LD with correct position sequence", () => {
    const crumbs = [
      { name: "Home", url: "/" },
      { name: "Regional Hubs", url: "/region/id" },
      { name: "JIExpo Kemayoran", url: "/venues/jiexpo-kemayoran" },
    ];

    const jsonLd = generateBreadcrumbJsonLd(crumbs, "https://xpo.events") as any;

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement.length).toBe(3);
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[0].name).toBe("Home");
    expect(jsonLd.itemListElement[2].position).toBe(3);
    expect(jsonLd.itemListElement[2].item).toBe("https://xpo.events/venues/jiexpo-kemayoran");
  });

  it("S1.6: generates Schema.org WebSite JSON-LD with Sitelinks searchbox action", () => {
    const jsonLd = generateMiceWebsiteJsonLd("https://xpo.events") as any;

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("WebSite");
    expect(jsonLd.name).toBe("XPO - MICE Digital Ecosystem");
    expect(jsonLd.potentialAction["@type"]).toBe("SearchAction");
    expect(jsonLd.potentialAction.target.urlTemplate).toContain("q={search_term_string}");
  });

  it("S1.7: validates Progressive Web App (PWA) manifest configuration", () => {
    const pwaManifest = manifest();

    expect(pwaManifest.name).toBe("XPO - MICE Digital Ecosystem");
    expect(pwaManifest.short_name).toBe("XPO");
    expect(pwaManifest.start_url).toBe("/");
    expect(pwaManifest.display).toBe("standalone");
    expect(pwaManifest.theme_color).toBe("#2563eb");
    expect(pwaManifest.background_color).toBe("#0a0f1d");
    expect(pwaManifest.icons?.length).toBeGreaterThanOrEqual(4);
    expect(pwaManifest.shortcuts?.length).toBeGreaterThanOrEqual(3);
  });
});
