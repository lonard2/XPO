import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import { render, screen } from "@testing-library/react";
import { EventPageShell } from "@/components/themed/EventPageShell";
import { HospitalityTourismView } from "@/components/themed/archetypes/HospitalityTourismView";
import { FaithPilgrimageCongressView } from "@/components/themed/archetypes/FaithPilgrimageCongressView";
import { TechDevSummitView } from "@/components/themed/archetypes/TechDevSummitView";

const SHELL = path.resolve(__dirname, "../../../src/components/themed/EventPageShell.tsx");
const PROGRAMS = path.resolve(__dirname, "../../../src/components/themed/ShowcaseProgramGrid.tsx");

/**
 * Structural guard for event-detail Expressive motion.
 *
 * The detail page is where the homepage hero sends visitors, but the shell
 * shipped with zero motion hooks: the metadata strip mounts all at once
 * and the program grid shared by every archetype view has hover-only
 * feedback. The h1 itself stays unanimated on purpose (largest-paint
 * element); everything around it cascades.
 */
describe("Quality Gate: Event-detail expressive wiring", () => {
  const shell = fs.readFileSync(SHELL, "utf8");
  const programs = fs.readFileSync(PROGRAMS, "utf8");

  const lineWith = (src: string, needle: string) =>
    src.split("\n").find((line) => line.includes(needle)) ?? "";

  it("cascades the hero metadata strip", () => {
    expect(lineWith(shell, "border-t border-white/10 grid")).toContain("stagger-children");
  });

  it("leaves the h1 unanimated for largest-paint", () => {
    const h1 = lineWith(shell, "drop-shadow-xs");
    expect(h1).toContain("<h1");
    expect(h1).not.toMatch(/stagger|animate|hero-/);
  });

  it("glows the archetype hero frame with the event accent", () => {
    expect(lineWith(shell, "border-[var(--archetype-border)]")).toContain("ambient-glow");
  });

  it("cascades the shared program grid with press physics on cards", () => {
    expect(lineWith(programs, "grid grid-cols-1 md:grid-cols-3")).toContain("stagger-children");
    expect(lineWith(programs, "<Card key={idx}")).toContain("card-interactive-3d");
  });
});

describe("Quality Gate: Event page sizes", () => {
  const smallEvent = {
    id: "evt-small-1",
    title: "Mall Pop-up Print Fair 2026",
    slug: "mall-popup-2026",
    tagline: "Indie prints weekend",
    description: "Small pop-up.",
    archetype: "INDUSTRIAL_B2B",
    scale: "MEDIUM",
    format: "IN_PERSON",
    startDate: new Date("2026-11-20T09:00:00Z"),
    endDate: new Date("2026-11-22T18:00:00Z"),
    venue: {
      name: "Grand Mall Atrium",
      slug: "grand-mall-atrium",
      city: "Jakarta",
      address: "Jl. Jendral Sudirman",
    },
    minTicketPrice: 0,
    locale: "en",
    ticketTiers: [],
    agendaItems: [],
    booths: [],
    perks: [],
  };

  it("hides the floor-map tab on SMALL but keeps overview", () => {
    render(<EventPageShell {...smallEvent} pageSize="SMALL"><div>child</div></EventPageShell>);
    // Tab buttons carry no tab role; match the visible label instead.
    expect(screen.queryByText(/Floor Map/)).toBeNull();
    expect(screen.getByText("child")).toBeDefined();
  });

  it("keeps the floor-map tab by default", () => {
    const { unmount } = render(<EventPageShell {...smallEvent}><div>child</div></EventPageShell>);
    expect(screen.getByText(/Floor Map/)).toBeDefined();
    unmount();
  });

  it("hides buyer-appointment triggers on SMALL", () => {
    const { unmount } = render(
      <HospitalityTourismView event={smallEvent as never} locale="en" pageSize="SMALL" />
    );
    expect(screen.queryAllByText(/Request Buyer Appointment/i)).toHaveLength(0);
    unmount();
    render(<HospitalityTourismView event={smallEvent as never} locale="en" />);
    expect(screen.getAllByText(/Request Buyer Appointment/i).length).toBeGreaterThan(0);
  });

  it("hides showcase channels on SMALL", () => {
    const withChannels = {
      ...smallEvent,
      showcaseJson: JSON.stringify({ channels: [{ code: "EN", lang: "English" }] }),
    };
    const { unmount } = render(
      <FaithPilgrimageCongressView event={withChannels as never} locale="en" pageSize="SMALL" />
    );
    expect(
      screen.queryByText(/Simultaneous Interpretation Channels/i)
    ).toBeNull();
    unmount();
    render(<FaithPilgrimageCongressView event={withChannels as never} locale="en" />);
    expect(
      screen.getByText(/Simultaneous Interpretation Channels/i)
    ).toBeDefined();
  });

  it("hides the livestream channel on SMALL", () => {
    const withStream = {
      ...smallEvent,
      showcaseJson: JSON.stringify({ livestreamUrl: "https://stream.example.com/live" }),
    };
    const { unmount } = render(
      <TechDevSummitView event={withStream as never} locale="en" pageSize="SMALL" />
    );
    expect(screen.queryByText(/Open Stream/i)).toBeNull();
    unmount();
    render(<TechDevSummitView event={withStream as never} locale="en" />);
    expect(screen.getByText(/Open Stream/i)).toBeDefined();
  });
});
