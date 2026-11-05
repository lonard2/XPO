import { describe, it, expect } from "vitest";
import {
  PAGE_SIZES,
  VISIBILITY,
  resolvePageSize,
  listingWhere,
  scheduleWhere,
  stripDiscreetFields,
} from "@/lib/discovery/presentation";

describe("Event presentation tiers", () => {
  it("pins the tier and visibility vocabularies", () => {
    expect([...PAGE_SIZES]).toEqual(["LARGE", "MEDIUM", "SMALL"]);
    expect([...VISIBILITY]).toEqual(["PUBLIC", "DISCREET", "HIDDEN"]);
  });

  it("lets an explicit event tier beat the venue suggestion", () => {
    expect(
      resolvePageSize({ eventTier: "SMALL", venueSize: "LARGE" })
    ).toBe("SMALL");
  });

  it("inherits the venue suggestion without an explicit choice", () => {
    expect(
      resolvePageSize({ eventTier: null, venueSize: "MEDIUM" })
    ).toBe("MEDIUM");
  });

  it("resolves LARGE when nothing is chosen anywhere", () => {
    expect(resolvePageSize({ eventTier: null, venueSize: null })).toBe("LARGE");
  });

  it("exposes listing and schedule filters with exact shapes", () => {
    expect(listingWhere()).toEqual({ visibility: "PUBLIC" });
    expect(scheduleWhere()).toEqual({
      visibility: { in: ["PUBLIC", "DISCREET"] },
    });
  });

  it("strips identity from discreet rows and keeps hall and dates", () => {
    const stub = stripDiscreetFields({
      id: "evt-1",
      title: "Secret Car Launch",
      organizer: { name: "Car Co" },
      organizerName: "Car Co",
      heroImageUrl: "https://img/x.jpg",
      tagline: "Vroom",
      description: "Secret",
      brandingConfigJson: "{}",
      ticketTiers: [],
      agendaItems: [],
      booths: [],
      venueHallName: "Grand Ballroom",
      startDate: "2026-11-20T09:00:00Z",
      endDate: "2026-11-20T18:00:00Z",
    });
    expect(stub).toEqual({
      venueHallName: "Grand Ballroom",
      startDate: "2026-11-20T09:00:00Z",
      endDate: "2026-11-20T18:00:00Z",
    });
    expect(JSON.stringify(stub)).not.toContain("Secret Car Launch");
  });
});
