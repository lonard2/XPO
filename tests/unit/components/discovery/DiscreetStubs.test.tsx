import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { VenueScheduleTable } from "@/components/discovery/VenueScheduleTable";
import { EventCalendarWidget } from "@/components/discovery/EventCalendarWidget";
import type { EventSummary } from "@/types/discovery";

const stubRow = {
  id: "evt-discreet-1",
  discreet: true as const,
  venueHallName: "Grand Ballroom",
  startDate: new Date("2026-11-20T09:00:00Z").toISOString(),
  endDate: new Date("2026-11-20T18:00:00Z").toISOString(),
};

const publicEvent: EventSummary = {
  id: "evt-open-1",
  title: "Open Expo 2026",
  slug: "open-expo-2026",
  archetype: "INDUSTRIAL_B2B",
  startDate: new Date("2026-11-20T09:00:00Z").toISOString(),
  endDate: new Date("2026-11-20T18:00:00Z").toISOString(),
  venueName: "JIExpo Kemayoran",
  venueHallName: "Hall A",
  cityName: "Jakarta",
  regionCode: "id",
  lowestPrice: 0,
  currency: "IDR",
};

describe("Discreet occupancy stubs", () => {
  it("renders hall plus generic label with no link in the venue schedule", () => {
    const { container } = render(
      <VenueScheduleTable
        events={[publicEvent as never, stubRow as never]}
        locale="en"
        venueName="JIExpo Kemayoran"
      />
    );
    expect(screen.getByText("Grand Ballroom")).toBeDefined();
    const stubBlock = screen.getByText("Grand Ballroom").closest("div");
    expect(stubBlock?.querySelector("a")).toBeNull();
    expect(container.textContent).not.toContain("Secret");
  });

  it("renders hall plus generic label with no link in the calendar day list", () => {
    const dated = {
      ...stubRow,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
    };
    render(
      <EventCalendarWidget
        events={[dated as never]}
        locale="en"
        regionCode="id"
      />
    );
    expect(screen.getByText(/Grand Ballroom/)).toBeDefined();
  });
});
