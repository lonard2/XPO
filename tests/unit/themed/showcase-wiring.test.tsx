import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechDevSummitView } from "@/components/themed/archetypes/TechDevSummitView";
import { FaithPilgrimageCongressView } from "@/components/themed/archetypes/FaithPilgrimageCongressView";
import { IndustrialB2BView } from "@/components/themed/archetypes/IndustrialB2BView";

const baseEvent: any = {
  id: "evt-showcase",
  title: "Showcase Probe Expo",
  description: "Probe event.",
  scale: "LARGE",
  format: "IN_PERSON",
  startDate: new Date("2026-09-14T09:00:00Z"),
  endDate: new Date("2026-09-17T18:00:00Z"),
  venue: { name: "JIExpo Kemayoran", city: "Jakarta", address: "Kemayoran" },
  venueHall: null,
  ticketTiers: [],
  agendaItems: [],
  booths: [],
  perks: [],
};

const withShowcase = {
  ...baseEvent,
  showcaseJson: JSON.stringify({
    livestreamUrl: "https://stream.example.com/live",
    livestreamLive: true,
    programs: [{ kind: "bounty", title: "Probe Bounty", detail: "$1", sponsor: "ProbeOrg" }],
    alerts: ["Doors open at 08:00"],
    channels: [{ code: "CH 1", lang: "English", note: "" }],
  }),
};

describe("showcase view wiring: render with data, silent without", () => {
  it("Tech view shows livestream card and bounties only with data", () => {
    const { unmount } = render(<TechDevSummitView event={baseEvent} locale="en" />);
    expect(screen.queryByText("Live Stream Active")).toBeNull();
    expect(screen.queryByText("Bounty Tracks")).toBeNull();
    unmount();

    render(<TechDevSummitView event={withShowcase} locale="en" />);
    expect(screen.getByText("Live Stream Active")).toBeInTheDocument();
    expect(screen.getByText("Probe Bounty")).toBeInTheDocument();
  });

  it("Faith view shows channels only with data", () => {
    const { unmount } = render(<FaithPilgrimageCongressView event={baseEvent} locale="en" />);
    expect(screen.queryByText("Congress Simultaneous Interpretation Channels")).toBeNull();
    unmount();

    render(<FaithPilgrimageCongressView event={withShowcase} locale="en" />);
    expect(screen.getByText("Congress Simultaneous Interpretation Channels")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("Industrial view shows program highlights only with data", () => {
    const { unmount } = render(<IndustrialB2BView event={baseEvent} locale="en" />);
    expect(screen.queryByText("Featured Exhibits & Demonstrations")).toBeNull();
    unmount();

    render(
      <IndustrialB2BView
        event={{ ...withShowcase, showcaseJson: JSON.stringify({ programs: [{ kind: "demo", title: "Probe Demo", detail: "", sponsor: "" }] }) }}
        locale="en"
      />
    );
    expect(screen.getByText("Featured Exhibits & Demonstrations")).toBeInTheDocument();
    expect(screen.getByText("Probe Demo")).toBeInTheDocument();
  });
});
