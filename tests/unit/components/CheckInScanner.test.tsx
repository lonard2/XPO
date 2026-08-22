import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("renders quick test scenario simulation buttons", () => {
    render(<CheckInScanner defaultEventId="ev-1" />);

    expect(screen.getByText("Valid Pass")).toBeDefined();
    expect(screen.getByText("VIP Delegate")).toBeDefined();
    expect(screen.getByText("Double Scan")).toBeDefined();
    expect(screen.getByText("Fraud / Tamper")).toBeDefined();
  });
});
