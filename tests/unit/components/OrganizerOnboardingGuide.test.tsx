import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { OrganizerOnboardingGuide } from "@/components/organizer/OrganizerOnboardingGuide";

describe("Component: OrganizerOnboardingGuide", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the 4 core organizer milestones and header badge", () => {
    render(
      <OrganizerOnboardingGuide
        locale="en"
        hasEvents={false}
        hasTickets={false}
        hasBooths={false}
        totalEvents={0}
      />
    );

    expect(screen.getByText("Organizer Onboarding & Operational Roadmap")).toBeDefined();
    expect(screen.getByText("0 of 4 Complete")).toBeDefined();
    expect(screen.getByText("1. Create Exhibition & Select Archetype")).toBeDefined();
    expect(screen.getByText("2. Define Ticket Passes & Tiers")).toBeDefined();
    expect(screen.getByText("3. Assign Floor Booths & Tenants")).toBeDefined();
    expect(screen.getByText("4. Deploy QR Check-In Scanner")).toBeDefined();
  });

  it("reflects completed milestones based on active data", () => {
    render(
      <OrganizerOnboardingGuide
        locale="en"
        hasEvents={true}
        hasTickets={true}
        hasBooths={true}
        totalEvents={3}
      />
    );

    expect(screen.getByText("3 of 4 Complete")).toBeDefined();
    const doneBadges = screen.getAllByText("Done");
    expect(doneBadges.length).toBe(3);
  });

  it("toggles collapse and expand states", () => {
    render(
      <OrganizerOnboardingGuide
        locale="en"
        hasEvents={false}
        hasTickets={false}
        hasBooths={false}
        totalEvents={0}
      />
    );

    const toggleBtn = screen.getByRole("button", { name: /collapse onboarding guide/i });
    expect(screen.getByText("Roadmap Readiness")).toBeDefined();

    fireEvent.click(toggleBtn);
    expect(screen.queryByText("Roadmap Readiness")).toBeNull();
  });

  it("dismisses the onboarding guide and persists to localStorage", () => {
    const { unmount } = render(
      <OrganizerOnboardingGuide
        locale="en"
        hasEvents={false}
        hasTickets={false}
        hasBooths={false}
        totalEvents={0}
      />
    );

    const dismissBtn = screen.getByRole("button", { name: /dismiss onboarding guide/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText("Organizer Onboarding & Operational Roadmap")).toBeNull();
    expect(localStorage.getItem("xpo_organizer_onboarding_dismissed_v1")).toBe("true");

    unmount();

    // Re-rendering should honor the dismissed state
    render(
      <OrganizerOnboardingGuide
        locale="en"
        hasEvents={false}
        hasTickets={false}
        hasBooths={false}
        totalEvents={0}
      />
    );
    expect(screen.queryByText("Organizer Onboarding & Operational Roadmap")).toBeNull();
  });

  it("renders 1-click template links for instant onboarding", () => {
    render(
      <OrganizerOnboardingGuide
        locale="en"
        hasEvents={false}
        hasTickets={false}
        hasBooths={false}
        totalEvents={0}
      />
    );

    const industrialLink = screen.getByRole("link", { name: /industrial b2b/i });
    expect(industrialLink).toBeDefined();
    expect(industrialLink.getAttribute("href")).toBe("/en/events/new?template=industrial");

    const techLink = screen.getByRole("link", { name: /tech summit/i });
    expect(techLink).toBeDefined();
    expect(techLink.getAttribute("href")).toBe("/en/events/new?template=tech");
  });
});
