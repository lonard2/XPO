import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventPageShell } from "@/components/themed/EventPageShell";
import {
  IndustrialB2BView,
  TechDevSummitView,
  MedicalSymposiumView,
  FinanceInvestorView,
  PopCultureGamingView,
  MusicFestivalView,
  MegaExpoPavilionView,
  GovernmentDiplomaticView,
  IncentiveRetreatView,
} from "@/components/themed/archetypes";

const mockBaseEvent = {
  id: "evt-test-1",
  title: "Indonesia Industrial & Automation Expo 2026",
  slug: "mfg-indo-2026",
  tagline: "The premier heavy engineering and robotics convention",
  description: "Comprehensive exhibition of CNC tools and automation systems.",
  scale: "LARGE",
  format: "IN_PERSON",
  startDate: new Date("2026-09-14T09:00:00Z"),
  endDate: new Date("2026-09-17T18:00:00Z"),
  venue: {
    name: "JIExpo Kemayoran",
    city: "Central Jakarta",
    address: "Arena JIExpo Kemayoran, Jakarta Pusat",
    transitInfo: "TransJakarta Corridor 2C",
  },
  venueHall: {
    name: "Hall A1",
    capacity: 12000,
    floorAreaSqm: 10500,
  },
  ticketTiers: [
    {
      id: "tier-free",
      name: "Trade Visitor Pass",
      price: 0,
      currency: "IDR",
      capacity: 10000,
      soldCount: 200,
      benefitsJson: JSON.stringify(["Floor access", "Digital catalog"]),
    },
    {
      id: "tier-vip",
      name: "VIP Procurement Buyer Pass",
      price: 450000,
      currency: "IDR",
      capacity: 500,
      soldCount: 50,
      benefitsJson: JSON.stringify(["VIP Buyer Lounge", "Fast Track Gate"]),
    },
  ],
  agendaItems: [
    {
      id: "ag-1",
      title: "Keynote: Smart Automation Architecture",
      speakerName: "Ir. Hendra Kusuma",
      speakerRole: "Automation Council Chairman",
      location: "Main Stage - Hall A1",
      startTime: new Date("2026-09-14T10:00:00Z"),
      endTime: new Date("2026-09-14T11:30:00Z"),
      track: "Automation",
    },
  ],
  booths: [
    {
      id: "b-1",
      companyName: "DMG MORI Precision Tools",
      boothNumber: "Hall A1 - 102",
      hallName: "Hall A1",
      industry: "CNC Machining",
      description: "High-precision 5-axis milling center manufacturer.",
    },
  ],
  perks: [
    {
      id: "p-1",
      title: "VIP Lounge Access",
      description: "Espresso bar and high-speed Wi-Fi.",
      iconName: "Coffee",
    },
  ],
};

describe("Phase 5: 9 Archetype Specialized Views & EventPageShell", () => {
  it("renders EventPageShell with dynamic CSS variables, breadcrumbs, and hero metadata", () => {
    const { container } = render(
      <EventPageShell
        id={mockBaseEvent.id}
        title={mockBaseEvent.title}
        slug={mockBaseEvent.slug}
        tagline={mockBaseEvent.tagline}
        description={mockBaseEvent.description}
        archetype="INDUSTRIAL_B2B"
        startDate={mockBaseEvent.startDate}
        endDate={mockBaseEvent.endDate}
        venue={{
          name: mockBaseEvent.venue.name,
          slug: "jiexpo-kemayoran",
          city: mockBaseEvent.venue.city,
          address: mockBaseEvent.venue.address,
          hallName: "Hall A1",
        }}
        minTicketPrice={0}
        locale="en"
      >
        <div data-testid="archetype-child">Child Component Content</div>
      </EventPageShell>
    );

    const root = container.querySelector("#event-page-root");
    expect(root).toBeInTheDocument();
    expect(root?.getAttribute("style")).toContain("--archetype-primary");
    expect(screen.getAllByText("Indonesia Industrial & Automation Expo 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Premier heavy engineering/i)).toBeInTheDocument();
    expect(screen.getByTestId("archetype-child")).toBeInTheDocument();
  });

  it("renders IndustrialB2BView with machinery catalog, RFQ modal trigger, and exhibitor booths", () => {
    render(<IndustrialB2BView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Procurement, Heavy Machinery & B2B Matchmaking/i)).toBeInTheDocument();
    expect(screen.getByText("CNC 5-Axis Milling Center X-9000")).toBeInTheDocument();
    expect(screen.getByText("DMG MORI Precision Tools")).toBeInTheDocument();

    const rfqBtn = screen.getByRole("button", { name: /Submit RFQ \/ Procurement Tender/i });
    expect(rfqBtn).toBeInTheDocument();
    fireEvent.click(rfqBtn);
    expect(screen.getByText("Target Exhibitor / Machine")).toBeInTheDocument();
  });

  it("renders TechDevSummitView with multi-track agenda, livestream widget, and hackathon RSVP", () => {
    render(<TechDevSummitView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Building Next-Generation Distributed Systems/i)).toBeInTheDocument();
    expect(screen.getByText("Live Stream Active")).toBeInTheDocument();
    expect(screen.getByText(/48-Hour Autonomous Systems Hackathon/i)).toBeInTheDocument();

    const rsvpBtn = screen.getByRole("button", { name: /RSVP for Hackathon/i });
    fireEvent.click(rsvpBtn);
    expect(screen.getByText(/RSVP Confirmed/i)).toBeInTheDocument();
  });

  it("renders MedicalSymposiumView with abstract reader, CME credit tracker, and speaker accreditation", () => {
    render(<MedicalSymposiumView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Advancing Evidence-Based Medicine/i)).toBeInTheDocument();
    expect(screen.getByText("CME Credit Eligibility")).toBeInTheDocument();
    expect(screen.getByText(/Phase III Efficacy of Next-Generation SGLT2 Inhibitors/i)).toBeInTheDocument();

    const cmeBtn = screen.getByRole("button", { name: /Register CME Physician License ID/i });
    fireEvent.click(cmeBtn);
    expect(screen.getByText(/CME Verification registered/i)).toBeInTheDocument();
  });

  it("renders FinanceInvestorView with pitch decks, deal-room booking, and KYC accreditation", () => {
    render(<FinanceInvestorView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Capital Allocation, Deal Structuring & Liquidity Horizons/i)).toBeInTheDocument();
    expect(screen.getByText("Chatham House Rule")).toBeInTheDocument();
    expect(screen.getByText("NexusPay Sovereign Gateway")).toBeInTheDocument();

    const verifyKycBtn = screen.getByRole("button", { name: /Verify Institutional Accreditation/i });
    fireEvent.click(verifyKycBtn);
    expect(screen.getByText("SEC-VERIFIED-PASS")).toBeInTheDocument();
  });

  it("renders PopCultureGamingView with cosplay security rules, creator alley, and autograph scheduler", () => {
    render(<PopCultureGamingView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Esports Arena, Celebrity Meet & Greets & Merch Drops/i)).toBeInTheDocument();
    expect(screen.getByText("Cosplay Security Guidelines")).toBeInTheDocument();
    expect(screen.getByText("Kenji Takahashi")).toBeInTheDocument();
    expect(screen.getByText("Sakura Artworks")).toBeInTheDocument();
  });

  it("renders MusicFestivalView with crowd density telemetry, stage timetable, and cashless guide", () => {
    render(<MusicFestivalView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Immersive Audio-Visual Stages & Headliner Lineups/i)).toBeInTheDocument();
    expect(screen.getByText("Stage Crowd Density")).toBeInTheDocument();
    expect(screen.getByText("RFID Wristband & Cashless Ecosystem")).toBeInTheDocument();
    expect(screen.getByText("Neon Main Stage")).toBeInTheDocument();
  });

  it("renders MegaExpoPavilionView with multi-pavilion directory, fireworks schedule, and promo radar", () => {
    render(<MegaExpoPavilionView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Multi-Pavilion Mega Fair, Nightly Fireworks & Flash Promos/i)).toBeInTheDocument();
    expect(screen.getByText("Grand Arena Fireworks")).toBeInTheDocument();
    expect(screen.getByText("Hall A: Automotive & Smart EV Expo")).toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy Arena")).toBeInTheDocument();
  });

  it("renders GovernmentDiplomaticView with protocol briefings, bilateral suites, and treaty agenda", () => {
    render(<GovernmentDiplomaticView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Bilateral Accords, Climate Compacts & Sovereign Dialogue/i)).toBeInTheDocument();
    expect(screen.getByText("Summit Security Briefing")).toBeInTheDocument();
    expect(screen.getByText("Republic of Indonesia")).toBeInTheDocument();
    expect(screen.getByText("Bilateral Suite Alpha")).toBeInTheDocument();
  });

  it("renders IncentiveRetreatView with excursion itinerary, wellness spa treatments, and VIP chauffeur notes", () => {
    render(<IncentiveRetreatView event={mockBaseEvent} locale="en" />);

    expect(screen.getByText(/Curated Horizon Retreat, Private Excursions & Gala Banquets/i)).toBeInTheDocument();
    expect(screen.getByText("Private Airport Transfers")).toBeInTheDocument();
    expect(screen.getByText(/Private Sunset Yacht & Coral Reef Snorkeling/i)).toBeInTheDocument();
    expect(screen.getByText("Traditional Balinese Herbal Deep-Tissue Massage")).toBeInTheDocument();
  });
});
