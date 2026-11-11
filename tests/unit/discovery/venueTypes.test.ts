import { describe, it, expect } from "vitest";
import {
  VENUE_TYPES,
  SPACE_KINDS,
  normalizeVenueType,
  normalizeSpaceKind,
  isVenueType,
  isSpaceKind,
  isHallVenue,
  countLabelKey,
  countLabelOneKey,
  metricLabelKey,
} from "@/lib/discovery/venueTypes";

describe("Venue type vocabulary", () => {
  it("contains the agreed venue types and no separate field or plaza type", () => {
    expect(VENUE_TYPES).toContain("CONVENTION_CENTER");
    expect(VENUE_TYPES).toContain("EXHIBITION_CENTER");
    expect(VENUE_TYPES).toContain("ARENA");
    expect(VENUE_TYPES).toContain("STADIUM");
    expect(VENUE_TYPES).toContain("MALL");
    expect(VENUE_TYPES).toContain("HOTEL");
    expect(VENUE_TYPES).toContain("COMMUNITY_HALL");
    expect(VENUE_TYPES).toContain("OUTDOOR");
    expect(VENUE_TYPES).not.toContain("FIELD");
    expect(VENUE_TYPES).not.toContain("OUTDOOR_PLAZA");
  });

  it("contains every space kind, including ballroom and outdoor", () => {
    for (const kind of [
      "HALL",
      "MEETING_ROOM",
      "ARENA",
      "FIELD",
      "COURT",
      "ATRIUM",
      "PAVILION",
      "BALLROOM",
      "OUTDOOR",
    ]) {
      expect(SPACE_KINDS).toContain(kind);
    }
  });

  it("normalizes case-insensitively and falls back to the defaults", () => {
    expect(normalizeVenueType("mall")).toBe("MALL");
    expect(normalizeVenueType("OUTDOOR")).toBe("OUTDOOR");
    expect(normalizeVenueType("not-a-type")).toBe("CONVENTION_CENTER");
    expect(normalizeVenueType(null)).toBe("CONVENTION_CENTER");

    expect(normalizeSpaceKind("atrium")).toBe("ATRIUM");
    expect(normalizeSpaceKind("BALLROOM")).toBe("BALLROOM");
    expect(normalizeSpaceKind("not-a-kind")).toBe("HALL");
    expect(normalizeSpaceKind(undefined)).toBe("HALL");
  });

  it("validates explicit values without defaulting", () => {
    expect(isVenueType("OUTDOOR")).toBe(true);
    expect(isVenueType("FIELD")).toBe(false);
    expect(isVenueType("mall")).toBe(false);
    expect(isSpaceKind("BALLROOM")).toBe(true);
    expect(isSpaceKind("PLAZA")).toBe(false);
  });

  it("uses halls for convention and exhibition centers, spaces elsewhere", () => {
    expect(isHallVenue("CONVENTION_CENTER")).toBe(true);
    expect(isHallVenue("EXHIBITION_CENTER")).toBe(true);
    expect(isHallVenue("MALL")).toBe(false);
    expect(isHallVenue("STADIUM")).toBe(false);
    expect(isHallVenue("OUTDOOR")).toBe(false);

    expect(countLabelKey("CONVENTION_CENTER")).toBe("hallsCount");
    expect(countLabelKey("MALL")).toBe("spacesCount");
    expect(countLabelKey("OUTDOOR")).toBe("spacesCount");
    expect(countLabelOneKey("CONVENTION_CENTER")).toBe("hallsCountOne");
    expect(countLabelOneKey("MALL")).toBe("spacesCountOne");

    expect(metricLabelKey("CONVENTION_CENTER")).toBe("hallsMetric");
    expect(metricLabelKey("EXHIBITION_CENTER")).toBe("hallsMetric");
    expect(metricLabelKey("MALL")).toBe("spacesMetric");
    expect(metricLabelKey("OUTDOOR")).toBe("spacesMetric");
  });
});
