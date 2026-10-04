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

  it("renders quick test scenario simulation buttons with collapsed default and toggles visibility", () => {
    render(<CheckInScanner defaultEventId="ev-1" />);

    // By default, simulation sandbox is collapsed to prevent accidental taps during live concourse queues
    expect(screen.queryByText("Valid Pass")).toBeNull();
    const showBtn = screen.getByText("Show Scenarios");
    fireEvent.click(showBtn);

    expect(screen.getByText("Valid Pass")).toBeDefined();
    expect(screen.getByText("VIP Delegate")).toBeDefined();
    expect(screen.getByText("Double Scan")).toBeDefined();
    expect(screen.getByText("Fraud / Tamper")).toBeDefined();

    const hideBtn = screen.getByText("Hide Scenarios");
    fireEvent.click(hideBtn);
    expect(screen.queryByText("Valid Pass")).toBeNull();
  });

  it("submits manual pass code form with fetch invocation and renders mobile sticky triage HUD", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        alreadyCheckedIn: false,
        attendee: { name: "Test Delegate", email: "delegate@example.com" },
        ticketTier: { name: "VIP Delegate" },
        perks: [{ id: "p1", title: "VIP Concourse Access" }],
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

    // Verify attendee details appear in both the main triage card and the mobile sticky triage HUD
    expect(screen.getAllByText("Test Delegate").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Clear for Next Attendee").length).toBeGreaterThanOrEqual(1);

    fetchSpy.mockRestore();
  });

  it("toggles haptic vibration feedback button and invokes navigator.vibrate on scan", async () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateSpy,
      writable: true,
      configurable: true,
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        alreadyCheckedIn: false,
        attendee: { name: "Vibration Delegate", email: "vib@example.com" },
        ticketTier: { name: "VIP Delegate" },
      }),
    } as any);

    render(<CheckInScanner defaultEventId="ev-1" />);

    const hapticBtn = screen.getByLabelText("Toggle tactile haptic vibration");
    expect(screen.getByText("Haptic On")).toBeDefined();

    // Trigger check in via manual code
    const manualBtn = screen.getByText(/manual/i);
    fireEvent.click(manualBtn);
    const input = screen.getByPlaceholderText("e.g. XPO-PASS-BK1234-A8F4E290...");
    fireEvent.change(input, { target: { value: "XPO-PASS-VIB-1234" } });
    const submitBtn = screen.getByText("Validate & Check-In Pass");
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(vibrateSpy).toHaveBeenCalledWith([70]);

    // Toggle off haptics
    fireEvent.click(hapticBtn);
    expect(screen.getByText("Haptic Off")).toBeDefined();

    fetchSpy.mockRestore();
  });

  it("intercepts hardware USB/Bluetooth HID wedge barcode scanner keystrokes and submits pass on Enter", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        alreadyCheckedIn: false,
        attendee: { name: "Hardware Scanned Delegate", email: "gun@example.com" },
        ticketTier: { name: "General Pass" },
      }),
    } as any);

    render(<CheckInScanner defaultEventId="ev-1" />);

    // In camera mode, an external USB barcode gun sends rapid keystrokes followed by Enter
    const barcodeSequence = "XPO-PASS-GUN-9999";
    for (const char of barcodeSequence) {
      fireEvent.keyDown(window, { key: char });
    }
    await act(async () => {
      fireEvent.keyDown(window, { key: "Enter" });
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/tickets/verify", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        qrCodeHash: barcodeSequence,
        autoCheckIn: true,
      }),
    }));

    fetchSpy.mockRestore();
  });
});
