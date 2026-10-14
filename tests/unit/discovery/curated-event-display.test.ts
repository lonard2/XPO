import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "@/components/discovery/EventCard";
import EventDetailPage from "@/app/[locale]/(attendee)/events/[slug]/page";
import { EventOrganizerSection } from "@/components/discovery/EventOrganizerSection";
import { type DiscoveryEvent } from "@/types/discovery";

import { db } from "@/lib/db";

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
}));

const baseMockEvent: DiscoveryEvent = {
  id: "test-event-curated-1",
  title: "Indonesia Industrial Machinery Expo 2026",
  slug: "indonesia-machinery-expo-2026",
  tagline: "Premier heavy robotics and CNC exhibition",
  description: "Full description of the industrial event with high-speed milling showcases.",
  archetype: "INDUSTRIAL_B2B",
  startDate: new Date("2026-09-14T09:00:00Z"),
  endDate: new Date("2026-09-17T18:00:00Z"),
  isFeatured: true,
  heroImageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
  scale: "LARGE",
  format: "IN_PERSON",
  regionId: "id",
  region: { id: "id", code: "ID", name: "Indonesia", currency: "IDR" },
  venueId: "venue-jiexpo",
  venue: {
    id: "venue-jiexpo",
    name: "JIExpo Kemayoran",
    slug: "jiexpo-kemayoran",
    city: "Central Jakarta",
    address: "Arena JIExpo, Jakarta Pusat",
    transitInfo: "TransJakarta Corridor 2C",
  },
  venueHall: {
    id: "hall-a1",
    name: "Hall A1",
  },
  ticketTiers: [
    { id: "tier-1", name: "Trade Visitor Pass", price: 0, currency: "IDR" },
  ],
};

describe("Curated Event Display - EventCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("T1.1: renders without throwing null pointer when organizer is null and isPlatformCurated is true", () => {
    const curatedEvent: DiscoveryEvent = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: "Debindo ITE",
      organizer: null,
    };

    expect(() =>
      render(React.createElement(EventCard, { event: curatedEvent, locale: "en" }))
    ).not.toThrow();
  });

  it("T1.2: displays event.organizerName and curated listing badge when isPlatformCurated is true", () => {
    const curatedEvent: DiscoveryEvent = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: "Debindo ITE",
      organizer: null,
    };

    render(React.createElement(EventCard, { event: curatedEvent, locale: "en" }));

    expect(screen.getByText(/Debindo ITE/i)).toBeInTheDocument();
    expect(screen.getByText(/Curated Listing|Official Venue Listing/i)).toBeInTheDocument();
  });

  it("T1.3: falls back to venue name when organizerName is null on curated event", () => {
    const curatedEventWithoutName: DiscoveryEvent = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: null,
      organizer: null,
      venue: {
        id: "venue-jiexpo",
        name: "JIExpo Kemayoran",
        slug: "jiexpo-kemayoran",
        city: "Central Jakarta",
        address: "Arena JIExpo, Jakarta Pusat",
        transitInfo: "TransJakarta Corridor 2C",
      },
    };

    render(React.createElement(EventCard, { event: curatedEventWithoutName, locale: "en" }));

    const matchingVenueElements = screen.getAllByText(/JIExpo Kemayoran/i);
    expect(matchingVenueElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Official Venue Listing|Curated Listing/i)).toBeInTheDocument();
  });

  it("T1.4: avoids rendering broken organizer links when organizer is null", () => {
    const curatedEvent: DiscoveryEvent = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: "Debindo ITE",
      organizer: null,
    };

    const { container } = render(React.createElement(EventCard, { event: curatedEvent, locale: "en" }));
    const links = Array.from(container.querySelectorAll("a"));

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      expect(href).not.toContain("undefined");
      expect(href).not.toContain("null");
      expect(href).not.toBe("#");
    });
  });

  it("T1.5: displays registered organizer name when isPlatformCurated is false and organizer is present", () => {
    const standardEvent: DiscoveryEvent = {
      ...baseMockEvent,
      isPlatformCurated: false,
      organizerId: "usr-org-1",
      organizerName: "Robotics Industry Association",
      organizer: {
        id: "usr-org-1",
        name: "Budi Santoso",
        organization: "Robotics Industry Association",
      },
    };

    render(React.createElement(EventCard, { event: standardEvent, locale: "en" }));

    expect(screen.getByText(/Robotics Industry Association/i)).toBeInTheDocument();
    expect(screen.queryByText(/Curated Listing/i)).toBeNull();
  });
});

describe("Curated Event Display - EventDetailPage Organizer Section", () => {
  it("T2.1: displays Official Listing trust badge, organizerName, and Curated MICE Directory Listing notice", () => {
    const event = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: "Debindo ITE Exhibitions",
      organizer: null,
    };

    render(React.createElement(EventOrganizerSection, { event, locale: "en" }));

    expect(screen.getByText(/Official Listing/i)).toBeInTheDocument();
    expect(screen.getByText("Debindo ITE Exhibitions")).toBeInTheDocument();
    expect(screen.getByText(/Curated MICE Directory Listing/i)).toBeInTheDocument();
  });

  it("T2.2: falls back to venue name cleanly when organizerName is null on curated event", () => {
    const event = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: null,
      organizer: null,
      venue: {
        id: "venue-bigsight",
        name: "Tokyo Big Sight",
        slug: "tokyo-big-sight",
        city: "Koto, Tokyo",
        address: "3-11-1 Ariake, Koto-ku, Tokyo",
      },
    };

    render(React.createElement(EventOrganizerSection, { event, locale: "en" }));

    expect(screen.getByText("Tokyo Big Sight")).toBeInTheDocument();
    expect(screen.getByText(/Official Listing/i)).toBeInTheDocument();
    expect(screen.getByText(/Curated MICE Directory Listing/i)).toBeInTheDocument();
  });

  it("T2.3: does not render broken organizer links or empty avatar fallbacks for curated events", () => {
    const event = {
      ...baseMockEvent,
      isPlatformCurated: true,
      organizerId: null,
      organizerName: "Japan Robot Association",
      organizer: null,
    };

    const { container } = render(React.createElement(EventOrganizerSection, { event, locale: "en" }));
    const links = Array.from(container.querySelectorAll("a"));

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      expect(href).not.toContain("undefined");
      expect(href).not.toContain("null");
    });
  });

  it("T2.4: displays verified organizer profile when isPlatformCurated is false and organizer is present", () => {
    const event = {
      ...baseMockEvent,
      isPlatformCurated: false,
      organizerId: "usr-org-99",
      organizerName: "Messe Frankfurt Japan",
      organizer: {
        id: "usr-org-99",
        name: "Kenji Sato",
        organization: "Messe Frankfurt Japan Ltd",
        email: "contact@messefrankfurt.jp",
      },
    };

    render(React.createElement(EventOrganizerSection, { event, locale: "en" }));

    expect(screen.getByText("Messe Frankfurt Japan Ltd")).toBeInTheDocument();
    expect(screen.getByText(/Verified Organizer/i)).toBeInTheDocument();
    expect(screen.queryByText(/Curated MICE Directory Listing/i)).toBeNull();
  });

  it("T2.5: renders complete EventDetailPage with EventOrganizerSection for curated event", async () => {
    vi.spyOn(db.event, "findUnique").mockResolvedValueOnce({
      ...baseMockEvent,
      startDate: new Date("2026-09-14T09:00:00Z"),
      endDate: new Date("2026-09-17T18:00:00Z"),
      isPlatformCurated: true,
      organizerId: null,
      organizerName: "Debindo ITE Curation",
      organizer: null,
      venue: {
        id: "venue-jiexpo",
        name: "JIExpo Kemayoran",
        slug: "jiexpo-kemayoran",
        city: "Central Jakarta",
        address: "Arena JIExpo, Jakarta Pusat",
        transitInfo: "TransJakarta Corridor 2C",
        region: { id: "id", code: "ID", name: "Indonesia", currency: "IDR" },
      },
      venueHall: {
        id: "hall-a1",
        name: "Hall A1",
      },
      ticketTiers: [],
      agendaItems: [],
      booths: [],
      perks: [],
    } as any);

    const pageElement = await EventDetailPage({
      params: Promise.resolve({ locale: "en", slug: "indonesia-machinery-expo-2026" }),
    });

    render(pageElement);

    expect(screen.getByText("Debindo ITE Curation")).toBeInTheDocument();
    expect(screen.getByText(/Curated MICE Directory Listing/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Listing/i)).toBeInTheDocument();
  });
});
