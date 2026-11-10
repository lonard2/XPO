import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { MajorVenuesUpcomingSection } from "@/components/discovery/MajorVenuesUpcomingSection";
import type { VenueWithEvents } from "@/types/discovery";

const soon = new Date(Date.now() + 86400000 * 10).toISOString();

const activeVenue = {
  id: "v-jiexpo",
  name: "JIExpo Kemayoran (Jakarta International Expo)",
  slug: "jiexpo-kemayoran",
  city: "Jakarta",
  address: "Jl. Benyamin Sueb",
  transitInfo: "KRL Stasiun Rajawali",
  imageUrl: null,
  regionCode: "id",
  halls: [{ id: "h1", name: "Hall A" }],
  events: [
    {
      id: "e1",
      title: "Live Industrial Expo",
      slug: "live-industrial-expo",
      archetype: "INDUSTRIAL_B2B",
      startDate: soon,
      endDate: soon,
      venueHallName: "Hall A",
      minPrice: 0,
    },
  ],
} as unknown as VenueWithEvents;

const quietVenue = {
  id: "v-ice",
  name: "ICE BSD City (Indonesia Convention Exhibition)",
  slug: "ice-bsd-city",
  city: "Tangerang",
  address: "BSD City",
  transitInfo: "BSD Link shuttle",
  imageUrl: null,
  regionCode: "id",
  halls: [{ id: "h2", name: "Hall 5" }],
  events: [],
} as unknown as VenueWithEvents;

describe("MajorVenuesUpcomingSection curation", () => {
  it("gives venues with attendable events a card and the rest a compact line", () => {
    render(
      <MajorVenuesUpcomingSection venues={[activeVenue, quietVenue]} locale="en" regionCode="id" />
    );

    // Both venues keep a card: the section doubles as the venue directory.
    expect(screen.getAllByText("Live Industrial Expo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jakarta International Expo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ICE BSD City").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Indonesia Convention Exhibition").length).toBeGreaterThan(0);

    // The quiet one says so once, without a 0 count masquerading as a status.
    expect(screen.getByText("No events announced yet")).toBeDefined();
    expect(screen.queryByText(/0 LISTED/i)).toBeNull();
    expect(screen.queryByText("Also in this edition")).toBeNull();
  });

  it("keeps every venue when nothing in the edition is scheduled", () => {
    const { container } = render(
      <MajorVenuesUpcomingSection venues={[quietVenue]} locale="en" regionCode="id" />
    );

    // No spotlight row exists, but the directory still carries the venue.
    expect(container.querySelector("[data-venue-directory]")).not.toBeNull();
    expect(screen.getAllByText("ICE BSD City").length).toBeGreaterThan(0);
    expect(screen.getByText("No events announced yet")).toBeDefined();
  });
});
