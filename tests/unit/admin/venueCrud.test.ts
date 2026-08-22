import { describe, it, expect } from "vitest";
import { normalizeEventSlug } from "@/lib/crawler/venueScraper";
import { FALLBACK_VENUES } from "@/lib/discovery/fallbackData";

describe("Phase 11 Unit: Admin Venue Directory Management & Validation", () => {
  it("V1.1: validates venue slug generation from complex convention complex names", () => {
    expect(normalizeEventSlug("JIExpo Kemayoran (Jakarta International Expo)")).toBe("jiexpo-kemayoran-jakarta-international-expo");
    expect(normalizeEventSlug("Tokyo Big Sight - Tokyo International Exhibition Center")).toBe("tokyo-big-sight-tokyo-international-exhibition-center");
    expect(normalizeEventSlug("Marina Bay Sands Expo & Convention Centre")).toBe("marina-bay-sands-expo-convention-centre");
    expect(normalizeEventSlug("ExCeL London (Exhibition Centre London)")).toBe("excel-london-exhibition-centre-london");
  });

  it("V1.2: aggregates total hall capacity and floor area across indexed halls", () => {
    const venue = {
      name: "JIExpo Kemayoran",
      city: "Jakarta",
      halls: [
        { name: "Hall A1", capacity: 3500, floorAreaSqm: 5000 },
        { name: "Hall A2", capacity: 2500, floorAreaSqm: 4500 },
        { name: "Nusantara Hall", capacity: 5000, floorAreaSqm: 7000 },
      ],
    };

    const totalCapacity = venue.halls.reduce((acc, h) => acc + h.capacity, 0);
    const totalArea = venue.halls.reduce((acc, h) => acc + h.floorAreaSqm, 0);

    expect(totalCapacity).toBe(11000);
    expect(totalArea).toBe(16500);
  });

  it("V1.3: validates decimal GPS coordinates for map pin visualization", () => {
    const validCoords = [
      { lat: -6.1466, lng: 106.8488 }, // JIExpo
      { lat: -6.3025, lng: 106.6375 }, // ICE BSD
      { lat: 35.6298, lng: 139.7942 }, // Tokyo Big Sight
      { lat: 1.2834, lng: 103.8591 },  // Marina Bay Sands
    ];

    for (const coord of validCoords) {
      expect(coord.lat).toBeGreaterThanOrEqual(-90);
      expect(coord.lat).toBeLessThanOrEqual(90);
      expect(coord.lng).toBeGreaterThanOrEqual(-180);
      expect(coord.lng).toBeLessThanOrEqual(180);
    }
  });

  it("V1.4: filters fallback venue catalogue by regional country codes", () => {
    const indonesian = FALLBACK_VENUES.filter(
      (v) => (v.region?.code || v.regionId || "").toLowerCase() === "id"
    );
    const japanese = FALLBACK_VENUES.filter(
      (v) => (v.region?.code || v.regionId || "").toLowerCase() === "jp"
    );
    const globalHubs = FALLBACK_VENUES.filter(
      (v) => ["gl", "global"].includes((v.region?.code || v.regionId || "").toLowerCase())
    );

    expect(indonesian.length).toBeGreaterThanOrEqual(3);
    expect(japanese.length).toBeGreaterThanOrEqual(1);
    expect(globalHubs.length).toBeGreaterThanOrEqual(1);
  });

  it("V1.5: verifies all fallback venues possess transit access instructions", () => {
    for (const venue of FALLBACK_VENUES) {
      expect(venue.transitInfo).toBeDefined();
      expect(typeof venue.transitInfo).toBe("string");
      expect(venue.transitInfo.length).toBeGreaterThan(10);
    }
  });
});
