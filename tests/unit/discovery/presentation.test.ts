import { describe, it, expect } from "vitest";
import {
  PAGE_SIZES,
  VISIBILITY,
  resolvePageSize,
  listingWhere,
  scheduleWhere,
  stripDiscreetFields,
  toScheduleRows,
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

  it("maps mixed rows to passthrough plus stubs, preserving order", () => {
    const rows = toScheduleRows([
      { id: "a", visibility: "PUBLIC", title: "Open Expo", venueHallName: "Hall A", startDate: "2026-11-20T09:00:00Z", endDate: "2026-11-20T10:00:00Z" },
      { id: "b", visibility: "DISCREET", title: "Secret", venueHallName: "Grand Ballroom", startDate: "2026-11-21T09:00:00Z", endDate: "2026-11-21T10:00:00Z" },
      { id: "c", visibility: "HIDDEN", title: "Hidden", venueHallName: "Hall B", startDate: "2026-11-22T09:00:00Z", endDate: "2026-11-22T10:00:00Z" },
    ]);
    // Public passes through by identity; discreet becomes a stub; hidden
    // never reaches schedules (defensive: dropped even if passed in).
    expect(rows).toHaveLength(2);
    expect((rows[0] as { id: string }).id).toBe("a");
    expect(rows[1]).toEqual({
      id: "b",
      discreet: true,
      venueHallName: "Grand Ballroom",
      startDate: "2026-11-21T09:00:00Z",
      endDate: "2026-11-21T10:00:00Z",
    });
  });
});
