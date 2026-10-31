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

    // The active venue is a full card with its event.
    expect(screen.getByText("Live Industrial Expo")).toBeDefined();
    expect(screen.getByText("Jakarta International Expo")).toBeDefined();

    // The quiet venue is reachable, but not as a card that says nothing is happening.
    expect(screen.getByText("Also in this edition")).toBeDefined();
    expect(screen.getByText("ICE BSD City")).toBeDefined();
    expect(screen.queryByText("Indonesia Convention Exhibition")).toBeNull();
    expect(screen.queryByText(/0 LISTED/i)).toBeNull();
  });

  it("renders no card grid when no venue has an attendable event", () => {
    const { container } = render(
      <MajorVenuesUpcomingSection venues={[quietVenue]} locale="en" regionCode="id" />
    );

    expect(container.querySelector(".stagger-children")).toBeNull();
    expect(screen.getByText("Also in this edition")).toBeDefined();
  });
});
