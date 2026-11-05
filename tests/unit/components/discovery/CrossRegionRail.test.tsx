import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { CrossRegionRail } from "@/components/discovery/CrossRegionRail";
import { type DiscoveryEvent } from "@/types/discovery";

const event = (id: string, title: string): DiscoveryEvent =>
  ({
    id,
    title,
    slug: `${id}-slug`,
    description: "Desc.",
    archetype: "TECH_DEV_SUMMIT",
    startDate: new Date("2026-12-01T09:00:00Z"),
    endDate: new Date("2026-12-03T18:00:00Z"),
    scale: "LARGE",
    format: "IN_PERSON",
    regionId: "jp",
    venue: {
      id: "v1",
      name: "Tokyo Big Sight",
      slug: "tokyo-big-sight",
      city: "Tokyo",
      address: "Ariake",
    },
    ticketTiers: [],
  }) as unknown as DiscoveryEvent;

describe("CrossRegionRail", () => {
  it("labels the rail by region and renders the events", () => {
    render(
      <CrossRegionRail
        items={[event("a", "Robotics Expo 2026"), event("b", "Cloud Summit 2026")]}
        locale="en"
        regionCode="jp"
        regionName="Japan"
      />
    );

    expect(screen.getByText(/Japan/)).toBeDefined();
    expect(screen.getByText("Robotics Expo 2026")).toBeDefined();
    expect(screen.getByText("Cloud Summit 2026")).toBeDefined();
  });

  it("uses a compact horizontal card when it has fewer than three items", () => {
    render(
      <CrossRegionRail
        items={[event("a", "Robotics Expo 2026")]}
        locale="en"
        regionCode="jp"
        regionName="Japan"
      />
    );

    const card = screen
      .getByText("Robotics Expo 2026")
      .closest("[data-variant]");
    expect(card?.getAttribute("data-variant")).toBe("horizontal");
  });

  it("renders nothing without items", () => {
    const { container } = render(
      <CrossRegionRail items={[]} locale="en" regionCode="jp" regionName="Japan" />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("Quality Gate: cross-region rail wiring", () => {
  const page = readFileSync(
    "src/app/[locale]/(attendee)/page.tsx",
    "utf8"
  );

  it("rotates the region daily and filters to public attendable events", () => {
    expect(page).toContain("pickRailRegion");
    expect(page).toContain("rankRailEvents");
    expect(page).toContain("listingWhere");
    expect(page).toContain("<CrossRegionRail");
  });
});
