import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as React from "react";
import { CheckInScanner } from "@/components/organizer/CheckInScanner";

describe("Phase 9 Component: CheckInScanner Door QR Console", () => {
  it("renders scanner console with Camera and Manual Hash input toggles", () => {
    render(<CheckInScanner defaultEventId="ev-1" />);

    expect(screen.getAllByText(/camera/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/manual/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Scans Processed")).toBeDefined();
    expect(screen.getByText("Entries Granted")).toBeDefined();
  });

  it("switches input mode to Manual Hash input and displays search form", () => {
    render(<CheckInScanner defaultEventId="ev-1" />);

    const manualBtn = screen.getByText(/manual/i);
    fireEvent.click(manualBtn);

    expect(screen.getByPlaceholderText("e.g. XPO-PASS-BK1234-A8F4E290...")).toBeDefined();
    expect(screen.getByText("Validate & Check-In Pass")).toBeDefined();
  });

  it("toggles audio feedback button", () => {
    render(<CheckInScanner defaultEventId="ev-1" />);

    const audioBtn = screen.getByLabelText("Toggle audio feedback");
    expect(screen.getByText("Audio On")).toBeDefined();

    fireEvent.click(audioBtn);
    expect(screen.getByText("Audio Off")).toBeDefined();
  });

  it("renders quick test scenario simulation buttons and toggles visibility", () => {
    render(<CheckInScanner defaultEventId="ev-1" />);

    expect(screen.getByText("Valid Pass")).toBeDefined();
    expect(screen.getByText("VIP Delegate")).toBeDefined();
    expect(screen.getByText("Double Scan")).toBeDefined();
    expect(screen.getByText("Fraud / Tamper")).toBeDefined();

    const toggleBtn = screen.getByText("Hide Scenarios");
    fireEvent.click(toggleBtn);
    expect(screen.queryByText("Valid Pass")).toBeNull();

    const showBtn = screen.getByText("Show Scenarios");
    fireEvent.click(showBtn);
    expect(screen.getByText("Valid Pass")).toBeDefined();
  });

  it("submits manual pass code form with fetch invocation", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        alreadyCheckedIn: false,
        attendee: { name: "Test Delegate", email: "delegate@example.com" },
        ticketTier: { name: "VIP Delegate" },
      }),
    } as any);

    render(<CheckInScanner defaultEventId="ev-1" />);

    const manualBtn = screen.getByText(/manual/i);
    fireEvent.click(manualBtn);

    const input = screen.getByPlaceholderText("e.g. XPO-PASS-BK1234-A8F4E290...");
    fireEvent.change(input, { target: { value: "XPO-PASS-TEST-1234" } });

    const submitBtn = screen.getByText("Validate & Check-In Pass");
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/tickets/verify", expect.objectContaining({
      method: "POST",
    }));

    fetchSpy.mockRestore();
  });
});
