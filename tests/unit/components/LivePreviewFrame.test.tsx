import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { LivePreviewFrame } from "@/components/organizer/LivePreviewFrame";

describe("Phase 9 Component: LivePreviewFrame Real-Time Visual Customizer", () => {
  it("renders live preview frame with event title, dates, and venue", () => {
    render(
      <LivePreviewFrame
        eventTitle="Indonesia Green Battery Summit 2027"
        tagline="The Clean Grid & EV Storage Convention"
        archetype="ENERGY_INFRASTRUCTURE"
        venueName="JIExpo Kemayoran"
        hallName="Hall A1"
        datesText="Apr 14 - Apr 17, 2027"
        primaryColor="#ca8a04"
        accentColor="#16a34a"
        fontFamily="font-sans"
      />
    );

    expect(screen.getByText("Indonesia Green Battery Summit 2027")).toBeDefined();
    expect(screen.getByText("The Clean Grid & EV Storage Convention")).toBeDefined();
    expect(screen.getByText("Apr 14 - Apr 17, 2027")).toBeDefined();
  });

  it("switches viewport modes between desktop, tablet, and mobile", () => {
    render(
      <LivePreviewFrame
        eventTitle="Test Event"
        archetype="TECH_DEV_SUMMIT"
        primaryColor="#6366f1"
        accentColor="#06b6d4"
        fontFamily="font-mono"
      />
    );

    const tabletBtn = screen.getByLabelText("Tablet viewport");
    fireEvent.click(tabletBtn);
    expect(screen.getByText("Tablet (768px)")).toBeDefined();

    const mobileBtn = screen.getByLabelText("Mobile viewport");
    fireEvent.click(mobileBtn);
    expect(screen.getByText("Mobile (375px)")).toBeDefined();

    const desktopBtn = screen.getByLabelText("Desktop viewport");
    fireEvent.click(desktopBtn);
    expect(screen.getByText("Desktop (100%)")).toBeDefined();
  });

  it("toggles section visibility for agenda, booths, and perks", () => {
    const { rerender } = render(
      <LivePreviewFrame
        eventTitle="Test Event"
        archetype="TECH_DEV_SUMMIT"
        primaryColor="#6366f1"
        accentColor="#06b6d4"
        fontFamily="font-sans"
        sectionsVisibility={{
          agenda: true,
          booths: true,
          tickets: true,
          perks: true,
        }}
      />
    );

    expect(screen.getByText("Featured Keynote Tracks & Timetable")).toBeDefined();
    expect(screen.getByText("Featured Exhibitors & Floor Booths")).toBeDefined();
    expect(screen.getByText("Attendee Perks & Exclusive Guidebook Treats")).toBeDefined();

    // Rerender with hidden sections
    rerender(
      <LivePreviewFrame
        eventTitle="Test Event"
        archetype="TECH_DEV_SUMMIT"
        primaryColor="#6366f1"
        accentColor="#06b6d4"
        fontFamily="font-sans"
        sectionsVisibility={{
          agenda: false,
          booths: false,
          tickets: true,
          perks: false,
        }}
      />
    );

    expect(screen.queryByText("Featured Keynote Tracks & Timetable")).toBeNull();
    expect(screen.queryByText("Featured Exhibitors & Floor Booths")).toBeNull();
    expect(screen.queryByText("Attendee Perks & Exclusive Guidebook Treats")).toBeNull();
  });
});
