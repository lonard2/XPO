import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventPageShell } from "@/components/themed/EventPageShell";

const baseProps = {
  id: "evt-temporal-1",
  title: "Jakarta Sports & Outdoor Adventure Expo 2026",
  slug: "jakarta-sports-outdoor-2026",
  tagline: "Trail gear, race packets, and sports science.",
  description: "Live sports expo.",
  archetype: "SPORTS_OUTDOOR" as const,
  startDate: new Date("2026-11-12T01:00:00Z"),
  endDate: new Date("2026-11-15T11:00:00Z"),
  venue: {
    name: "GBK Sports Complex",
    slug: "gbk-sports-complex",
    city: "Jakarta",
    address: "Gelora Bung Karno",
    hallName: null,
  },
  minTicketPrice: 0,
  currency: "IDR",
  locale: "en",
  ticketTiers: [
    {
      id: "tier-visitor",
      name: "Visitor Pass",
      price: 0,
      currency: "IDR",
      capacity: 12000,
      soldCount: 0,
      benefitsJson: "[]",
    },
  ],
  agendaItems: [],
  booths: [],
  organizerName: "Dyandra Promosindo",
  organizerEmail: "events@example.com",
};

describe("Event page temporal state", () => {
  it("stops selling passes once the event has concluded", () => {
    render(
      <EventPageShell {...baseProps} temporalStatus="PAST">
        <div>child</div>
      </EventPageShell>
    );

    expect(screen.queryByText("Reserve Passes & Tickets")).toBeNull();
    expect(screen.getByText("This event has concluded")).toBeInTheDocument();

    const related = screen.getAllByRole("link", { name: /Browse related events/ });
    expect(related.length).toBeGreaterThanOrEqual(1);
    for (const link of related) {
      expect(link).toHaveAttribute("href", "/en/events?archetype=SPORTS_OUTDOOR");
    }
  });

  it("reports the final day and the local closing time while live", () => {
    render(
      <EventPageShell
        {...baseProps}
        temporalStatus="LIVE"
        dayProgress={{ dayNumber: 4, totalDays: 4, isFinalDay: true }}
        closesAtLabel="18:00 WIB"
      >
        <div>child</div>
      </EventPageShell>
    );

    expect(screen.getAllByText("Final Day").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Day 4 of 4")).toBeInTheDocument();
    expect(screen.getAllByText("Closes 18:00 WIB").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reserve Passes & Tickets").length).toBeGreaterThanOrEqual(1);
  });

  it("replaces the future-tense agenda promise with honest live copy", () => {
    render(
      <EventPageShell
        {...baseProps}
        temporalStatus="LIVE"
        dayProgress={{ dayNumber: 2, totalDays: 4, isFinalDay: false }}
        closesAtLabel="18:00 WIB"
      >
        <div>child</div>
      </EventPageShell>
    );

    fireEvent.click(screen.getByRole("button", { name: /Agenda & Timetable/ }));

    expect(screen.getByText("Programme not published")).toBeInTheDocument();
    expect(screen.queryByText(/announced closer to the event opening/)).toBeNull();
    expect(
      screen.getByText(/The organizer has not published today's timetable/)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contact the organizer/ })).toHaveAttribute(
      "href",
      "mailto:events@example.com"
    );
  });

  it("leads with the day-of guide when live data exists", () => {
    render(
      <EventPageShell
        {...baseProps}
        temporalStatus="LIVE"
        dayProgress={{ dayNumber: 2, totalDays: 4, isFinalDay: false }}
        closesAtLabel="01:00 AM WIB"
        agendaItems={[
          {
            id: "agenda-1",
            title: "Trail Gear Trial",
            location: "Hall A",
            startTime: new Date("2026-11-13T03:00:00Z"),
            endTime: new Date("2026-11-13T04:00:00Z"),
          },
        ]}
        perks={[
          {
            id: "perk-1",
            title: "Gear Check",
            description: "Free bag storage for trial participants.",
          },
        ]}
        venueTransitInfo="KRL to Senayan"
        regionCode="ID"
      >
        <div>child</div>
      </EventPageShell>
    );

    expect(screen.getByText("Today at the event")).toBeInTheDocument();
    expect(screen.getByText("Sessions scheduled: 1")).toBeInTheDocument();
    expect(screen.getByText("Trail Gear Trial")).toBeInTheDocument();
    expect(screen.getByText("Gear Check")).toBeInTheDocument();
    expect(screen.getByText("Venue & transit")).toBeInTheDocument();
  });

  it("hides the perks section when the organizer published none", () => {
    render(
      <EventPageShell {...baseProps} temporalStatus="LIVE">
        <div>child</div>
      </EventPageShell>
    );

    expect(screen.queryByText("Attendee perks")).toBeNull();
  });

  it("describes a concluded event without promising future publication", () => {
    render(
      <EventPageShell {...baseProps} temporalStatus="PAST">
        <div>child</div>
      </EventPageShell>
    );

    fireEvent.click(screen.getByRole("button", { name: /Agenda & Timetable/ }));

    expect(
      screen.getByText("The organizer did not publish a timetable for this event.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/announced closer to the event opening/)).toBeNull();
  });
});
