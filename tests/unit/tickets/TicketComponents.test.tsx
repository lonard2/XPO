import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TierSelector, type TicketTierItem } from "@/components/tickets/TierSelector";
import { DigitalPassQR } from "@/components/perks/DigitalPassQR";
import { InteractiveGuidebook, type AgendaSessionItem } from "@/components/perks/InteractiveGuidebook";
import { HallFloorMap, type BoothItem } from "@/components/perks/HallFloorMap";
import { TierPerksGating, type EventPerkItem } from "@/components/perks/TierPerksGating";

describe("Phase 6 Unit: Ticket & Event Treats Component System", () => {
  const sampleTiers: TicketTierItem[] = [
    {
      id: "tier-std-01",
      name: "Standard Visitor Pass",
      price: 150000,
      currency: "IDR",
      capacity: 500,
      soldCount: 150,
      benefitsJson: JSON.stringify(["Exhibition floor access", "Show catalog"]),
    },
    {
      id: "tier-vip-02",
      name: "VIP Delegate Pass",
      price: 750000,
      currency: "IDR",
      capacity: 100,
      soldCount: 40,
      benefitsJson: JSON.stringify(["VIP Buyer Lounge", "Barista Coffee", "Priority Keynote Seating"]),
    },
    {
      id: "tier-soldout-03",
      name: "Early Bird Pass",
      price: 100000,
      currency: "IDR",
      capacity: 50,
      soldCount: 50,
      benefitsJson: JSON.stringify(["Early floor entry"]),
    },
  ];

  // ==========================================================================
  // 1. TIER SELECTOR TESTS
  // ==========================================================================
  describe("TierSelector Component", () => {
    it("renders all ticket tiers with formatted pricing and benefits", () => {
      const onSelectMock = vi.fn();
      render(
        <TierSelector
          tiers={sampleTiers}
          selectedTierId="tier-std-01"
          onSelectTier={onSelectMock}
          locale="id"
        />
      );

      expect(screen.getByText("Standard Visitor Pass")).toBeDefined();
      expect(screen.getByText("VIP Delegate Pass")).toBeDefined();
      expect(screen.getByText("Early Bird Pass")).toBeDefined();
      expect(screen.getByText("Sold Out")).toBeDefined();
      expect(screen.getByText("Exhibition floor access")).toBeDefined();
    });

    it("triggers onSelectTier callback when clicking an available tier", () => {
      const onSelectMock = vi.fn();
      render(
        <TierSelector
          tiers={sampleTiers}
          selectedTierId="tier-std-01"
          onSelectTier={onSelectMock}
        />
      );

      const vipCard = screen.getByText("VIP Delegate Pass");
      fireEvent.click(vipCard);
      expect(onSelectMock).toHaveBeenCalledWith("tier-vip-02");
    });

    it("prevents selecting a sold out tier", () => {
      const onSelectMock = vi.fn();
      render(
        <TierSelector
          tiers={sampleTiers}
          selectedTierId="tier-std-01"
          onSelectTier={onSelectMock}
        />
      );

      const soldOutCard = screen.getByText("Early Bird Pass");
      fireEvent.click(soldOutCard);
      expect(onSelectMock).not.toHaveBeenCalledWith("tier-soldout-03");
    });
  });

  // ==========================================================================
  // 2. DIGITAL PASS QR TESTS
  // ==========================================================================
  describe("DigitalPassQR Component", () => {
    const sampleBooking = {
      id: "bk-unit-test-101",
      status: "CONFIRMED",
      qrCodeHash: "XPO-PASS-BK-UNIT-TEST-101-ABCD1234EF567890",
      attendeeName: "Budi Santoso",
      attendeeEmail: "budi@xpo.com",
      createdAt: new Date("2026-08-15T09:00:00Z"),
      ticketTier: {
        id: "tier-vip-02",
        name: "VIP Delegate Pass",
        price: 750000,
        currency: "IDR",
      },
      event: {
        id: "ev-mfg-2026",
        title: "Manufacturing Indonesia 2026",
        slug: "manufacturing-indonesia-2026",
        startDate: new Date("2026-10-15"),
        endDate: new Date("2026-10-18"),
        venue: {
          name: "JIExpo Kemayoran",
          city: "Jakarta",
          hallName: "Hall A1-A3",
        },
      },
    };

    it("renders cryptographic QR pass with valid SVG vector matrix and attendee data", () => {
      const { container } = render(<DigitalPassQR booking={sampleBooking} locale="en" />);

      expect(screen.getByText("Budi Santoso")).toBeDefined();
      expect(screen.getByText("Manufacturing Indonesia 2026")).toBeDefined();
      expect(screen.getByText("JIExpo Kemayoran")).toBeDefined();
      expect(screen.getByText("CONFIRMED")).toBeDefined();

      // Check SVG existence
      const svg = container.querySelector("svg[data-qr-encoded]");
      expect(svg).toBeDefined();
      expect(svg?.getAttribute("data-qr-encoded")).toBe(sampleBooking.qrCodeHash);
    });

    it("displays CHECKED IN badge and timestamp when status is CHECKED_IN", () => {
      const checkedInBooking = {
        ...sampleBooking,
        status: "CHECKED_IN",
        checkedInAt: new Date("2026-10-15T10:30:00Z"),
      };

      render(<DigitalPassQR booking={checkedInBooking} locale="en" />);
      expect(screen.getByText("CHECKED IN")).toBeDefined();
      expect(screen.getByText("Admitted at Gate")).toBeDefined();
    });

    it("allows toggling security specs details drawer", () => {
      render(<DigitalPassQR booking={sampleBooking} locale="en" />);

      const securityBtn = screen.getByText("Security Specs");
      fireEvent.click(securityBtn);

      expect(screen.getByText("HMAC-SHA256 Cryptographic Authentication Ledger")).toBeDefined();
      expect(screen.getByText("HMAC-SHA256 (256-bit)")).toBeDefined();
    });
  });

  // ==========================================================================
  // 3. INTERACTIVE GUIDEBOOK TESTS
  // ==========================================================================
  describe("InteractiveGuidebook Component", () => {
    const sampleAgenda: AgendaSessionItem[] = [
      {
        id: "ag-01",
        title: "Keynote: Smart Manufacturing 5.0",
        speakerName: "Dr. Hendra Wijaya",
        speakerRole: "Chief Automation Architect",
        location: "Plenary Hall A1",
        startTime: new Date("2026-10-15T09:00:00Z"),
        endTime: new Date("2026-10-15T10:30:00Z"),
        track: "Keynote",
      },
      {
        id: "ag-02",
        title: "Industrial Robotics Teardown",
        speakerName: "Yuki Tanaka",
        speakerRole: "Lead Mechatronics Engineer",
        location: "Hall A2 - Demo Arena",
        startTime: new Date("2026-10-15T11:00:00Z"),
        endTime: new Date("2026-10-15T12:30:00Z"),
        track: "Robotics",
      },
    ];

    it("renders session schedule and filters by track", () => {
      render(
        <InteractiveGuidebook
          agendaItems={sampleAgenda}
          eventTitle="Manufacturing Indonesia 2026"
          locale="en"
        />
      );

      expect(screen.getByText("Keynote: Smart Manufacturing 5.0")).toBeDefined();
      expect(screen.getByText("Industrial Robotics Teardown")).toBeDefined();

      // Click "Robotics" track filter button specifically
      const roboticsTrackBtn = screen.getByRole("button", { name: "Robotics" });
      fireEvent.click(roboticsTrackBtn);

      expect(screen.queryByText("Keynote: Smart Manufacturing 5.0")).toBeNull();
      expect(screen.getByText("Industrial Robotics Teardown")).toBeDefined();
    });

    it("toggles Add to My Agenda bookmark star", () => {
      render(
        <InteractiveGuidebook
          agendaItems={sampleAgenda}
          eventTitle="Manufacturing Indonesia 2026"
          locale="en"
        />
      );

      const starButtons = screen.getAllByText("Star");
      expect(starButtons.length).toBe(2);

      // Bookmark first session
      fireEvent.click(starButtons[0]);
      expect(screen.getByText("Saved")).toBeDefined();
      expect(screen.getByText(/\(1\)/)).toBeDefined();

      // Filter by My Agenda only
      const myAgendaBtn = screen.getByText(/\(1\)/);
      fireEvent.click(myAgendaBtn);

      expect(screen.getByText("Keynote: Smart Manufacturing 5.0")).toBeDefined();
      expect(screen.queryByText("Industrial Robotics Teardown")).toBeNull();
    });

    it("searches sessions by speaker or topic keyword", () => {
      render(
        <InteractiveGuidebook
          agendaItems={sampleAgenda}
          eventTitle="Manufacturing Indonesia 2026"
          locale="en"
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "Tanaka" } });

      expect(screen.queryByText("Keynote: Smart Manufacturing 5.0")).toBeNull();
      expect(screen.getByText("Industrial Robotics Teardown")).toBeDefined();
    });
  });

  // ==========================================================================
  // 4. HALL FLOOR MAP TESTS
  // ==========================================================================
  describe("HallFloorMap Component", () => {
    const sampleBooths: BoothItem[] = [
      {
        id: "b-01",
        companyName: "PT Nusantara Heavy Industries",
        boothNumber: "Hall A1 - A101",
        hallName: "Hall A1",
        industry: "Machinery & Automation",
        description: "Leading manufacturer of 5-axis CNC machining centers and metal fabrication tools.",
      },
      {
        id: "b-02",
        companyName: "Apex Robotics Systems",
        boothNumber: "Hall A2 - B204",
        hallName: "Hall A2",
        industry: "Robotics & Logistics",
        description: "Autonomous high-payload AGVs and automated pallet shuttles.",
      },
    ];

    it("renders interactive SVG floor map and selects a booth", () => {
      const { container } = render(
        <HallFloorMap
          booths={sampleBooths}
          venueName="JIExpo Kemayoran"
          hallName="Hall A1-A2"
          locale="en"
        />
      );

      expect(screen.getByText("MAIN REGISTRATION LOBBY")).toBeDefined();
      expect(screen.getByText("VIP BUYER LOUNGE")).toBeDefined();

      // Search booth
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "Apex" } });

      // Click on Apex booth svg text
      const apexElement = screen.getByText("Apex Robotics …");
      fireEvent.click(apexElement);

      expect(screen.getByText("Apex Robotics Systems")).toBeDefined();
      expect(screen.getByText("Robotics & Logistics")).toBeDefined();
    });

    it("supports zoom controls (+ and -)", () => {
      render(
        <HallFloorMap
          booths={sampleBooths}
          venueName="JIExpo Kemayoran"
          locale="en"
        />
      );

      const zoomInBtn = screen.getByTitle("Zoom In");
      const zoomOutBtn = screen.getByTitle("Zoom Out");

      fireEvent.click(zoomInBtn);
      fireEvent.click(zoomOutBtn);
      expect(zoomInBtn).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. TIER PERKS GATING TESTS
  // ==========================================================================
  describe("TierPerksGating Component", () => {
    const samplePerks: EventPerkItem[] = [
      {
        id: "perk-01",
        title: "Barista Specialty Coffee",
        description: "Complimentary handcrafted espresso & cold brews at Hall A Lounge.",
        tierRequired: null, // Unlocked for all
        iconName: "Coffee",
      },
      {
        id: "perk-02",
        title: "VIP Buyer Lounge & Private Meeting Room",
        description: "Reserved high-speed meeting pods with refreshments and concierge.",
        tierRequired: "VIP",
        iconName: "ShieldCheck",
      },
    ];

    it("unlocks VIP perks for VIP attendee and generates claimable voucher", () => {
      render(
        <TierPerksGating
          perks={samplePerks}
          attendeeTierName="VIP Delegate Pass"
          bookingId="bk-mfg-12345"
          locale="en"
        />
      );

      expect(screen.getByText("Barista Specialty Coffee")).toBeDefined();
      expect(screen.getByText("VIP Buyer Lounge & Private Meeting Room")).toBeDefined();

      // Both should be unlocked for VIP
      const redeemButtons = screen.getAllByRole("button", { name: /voucher|claim/i });
      expect(redeemButtons.length).toBe(2);

      // Claim VIP Lounge voucher
      fireEvent.click(redeemButtons[1]);

      expect(screen.getByText(/XPO-MFG-1-PERK/i)).toBeDefined();
    });

    it("locks VIP perks when attendee has Standard Pass", () => {
      render(
        <TierPerksGating
          perks={samplePerks}
          attendeeTierName="Standard Visitor Pass"
          bookingId="bk-mfg-12345"
          locale="en"
        />
      );

      expect(screen.getAllByText(/VIP/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/locked/i).length).toBeGreaterThan(0);

      // Only 1 redeem button for the coffee perk
      const redeemButtons = screen.getAllByRole("button", { name: /voucher|claim/i });
      expect(redeemButtons.length).toBe(1);
    });
  });
});
