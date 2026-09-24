import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketCheckoutDrawer, type TicketCheckoutDrawerProps } from "@/components/tickets/TicketCheckoutDrawer";
import type { TicketTierItem } from "@/components/tickets/TierSelector";

describe("Phase 6 Unit: TicketCheckoutDrawer Component", () => {
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

  const mockEvent = {
    id: "evt-machinery-2026",
    title: "Indonesia International Industrial Expo 2026",
    slug: "indonesia-industrial-expo-2026",
    startDate: new Date("2026-10-15T09:00:00Z"),
    endDate: new Date("2026-10-18T18:00:00Z"),
    venue: {
      name: "JIExpo Kemayoran",
      city: "Jakarta",
      hallName: "Hall A1",
    },
    ticketTiers: sampleTiers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders event details, tiers, and inputs when open", () => {
    const onCloseMock = vi.fn();
    render(
      <TicketCheckoutDrawer
        event={mockEvent}
        isOpen={true}
        onClose={onCloseMock}
        locale="en"
      />
    );

    // Event title & venue context pill
    expect(screen.getAllByText("Indonesia International Industrial Expo 2026").length).toBeGreaterThan(0);
    expect(screen.getByText("JIExpo Kemayoran (Hall A1)")).toBeDefined();

    // Pass tiers
    expect(screen.getByText("Standard Visitor Pass")).toBeDefined();
    expect(screen.getByText("VIP Delegate Pass")).toBeDefined();

    // Form inputs
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Organization/i)).toBeDefined();
    expect(screen.getByLabelText(/Professional Role/i)).toBeDefined();
  });

  it("updates quantity via increment and decrement stepper buttons", () => {
    render(
      <TicketCheckoutDrawer
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        initialTierId="tier-std-01"
      />
    );

    // Default quantity is 1
    const decrementBtn = screen.getByLabelText("Decrease quantity");
    const incrementBtn = screen.getByLabelText("Increase quantity");

    expect(screen.getByRole("button", { name: "1 Pass" })).toBeDefined();

    // Decrement when at 1 should be disabled
    expect(decrementBtn).toBeDisabled();

    // Increment to 2
    fireEvent.click(incrementBtn);
    expect(screen.getByText("Confirm & Reserve 2 Passes (IDR 300,000)")).toBeDefined();

    // Increment to 3
    fireEvent.click(incrementBtn);
    expect(screen.getByText("Confirm & Reserve 3 Passes (IDR 450,000)")).toBeDefined();

    // Decrement back to 2
    fireEvent.click(decrementBtn);
    expect(screen.getByText("Confirm & Reserve 2 Passes (IDR 300,000)")).toBeDefined();
  });

  it("updates quantity via quick selector buttons", () => {
    render(
      <TicketCheckoutDrawer
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        initialTierId="tier-std-01"
      />
    );

    const btn3 = screen.getByRole("button", { name: "3 Passes" });
    fireEvent.click(btn3);
    expect(screen.getByText("Confirm & Reserve 3 Passes (IDR 450,000)")).toBeDefined();

    const btn5 = screen.getByRole("button", { name: "5 Passes" });
    fireEvent.click(btn5);
    expect(screen.getByText("Confirm & Reserve 5 Passes (IDR 750,000)")).toBeDefined();
  });

  it("validates required attendee name and email before submitting", async () => {
    render(
      <TicketCheckoutDrawer
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        initialTierId="tier-std-01"
      />
    );

    // Submit with empty form
    const submitBtn = screen.getByRole("button", { name: /Confirm & Reserve/i });
    const form = submitBtn.closest("form")!;
    fireEvent.submit(form);

    expect(await screen.findByText("Please enter your full attendee name.")).toBeDefined();

    // Fill name, but leave email empty
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: "Budi Santoso" } });
    fireEvent.submit(form);

    expect(await screen.findByText("Please enter a valid email address for digital pass delivery.")).toBeDefined();
  });

  it("submits checkout payload to API and shows confirmed pass card on success", async () => {
    const onSuccessMock = vi.fn();
    const mockBooking = {
      id: "BK-IND-9921",
      eventId: mockEvent.id,
      ticketTierId: "tier-std-01",
      attendeeName: "Budi Santoso",
      attendeeEmail: "budi@indonesia-machinery.co.id",
      quantity: 2,
      totalPrice: 300000,
      currency: "IDR",
      status: "CONFIRMED",
      qrCodeHash: "sha256:abc123mockhash987",
      svgQr: "<svg data-testid=\"qr-svg\"><rect /></svg>",
      ticketTier: {
        name: "Standard Visitor Pass",
      },
    };

    // Mock fetch
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        booking: mockBooking,
      }),
    });
    global.fetch = fetchMock as any;

    render(
      <TicketCheckoutDrawer
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        initialTierId="tier-std-01"
        onSuccess={onSuccessMock}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "budi@indonesia-machinery.co.id" } });
    fireEvent.change(screen.getByLabelText(/Organization/i), { target: { value: "PT Machinery Indonesia" } });
    fireEvent.change(screen.getByLabelText(/Professional Role/i), { target: { value: "Procurement Manager" } });

    // Select 2 passes
    fireEvent.click(screen.getByRole("button", { name: "2 Passes" }));

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Confirm & Reserve/i });
    fireEvent.click(submitBtn);

    // Verify fetch call
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: "evt-machinery-2026",
          tierId: "tier-std-01",
          attendeeName: "Budi Santoso",
          attendeeEmail: "budi@indonesia-machinery.co.id",
          organization: "PT Machinery Indonesia",
          jobTitle: "Procurement Manager",
          quantity: 2,
        }),
      });
    });

    // Check confirmed booking state
    expect(await screen.findByText("Pass Issued & Cryptographically Signed")).toBeDefined();
    expect(screen.getByText("BK-IND-9921")).toBeDefined();
    expect(screen.getByText("CONFIRMED")).toBeDefined();
    expect(screen.getByText("sha256:abc123mockhash987")).toBeDefined();
    expect(screen.getByText("Scan at door turnstile reader for admission")).toBeDefined();

    // Verify callback
    expect(onSuccessMock).toHaveBeenCalledWith(mockBooking);
  });

  it("handles checkout API error gracefully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: "Capacity exceeded. Only 1 ticket remaining.",
      }),
    });
    global.fetch = fetchMock as any;

    render(
      <TicketCheckoutDrawer
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        initialTierId="tier-std-01"
      />
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "budi@test.com" } });

    const submitBtn = screen.getByRole("button", { name: /Confirm & Reserve/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Capacity exceeded. Only 1 ticket remaining.")).toBeDefined();
  });
});
