import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckInScanner } from "@/components/organizer/CheckInScanner";

const admittedResponse = {
  valid: true,
  alreadyCheckedIn: false,
  status: "CHECKED_IN",
  checkedInAt: new Date().toISOString(),
  attendee: { name: "Amelia Hartono", email: "amelia@xpo.com" },
  ticketTier: { id: "t1", name: "Standard Pass" },
  event: { id: "ev-9", title: "Expo Nine" },
  perks: [],
};

const doubleResponse = {
  ...admittedResponse,
  alreadyCheckedIn: true,
  status: "CHECKED_IN",
};

function mockVerifySequence(responses: any[]) {
  const calls: any[] = [];
  const queue = [...responses];
  global.fetch = vi.fn().mockImplementation((_url: string, init?: any) => {
    calls.push(JSON.parse(init.body));
    const next = queue.length > 1 ? queue.shift() : queue[0];
    return Promise.resolve({ ok: true, json: () => Promise.resolve(next) });
  }) as any;
  return calls;
}

async function submitManualHash(hash: string) {
  fireEvent.click(screen.getByRole("button", { name: /manual code entry/i }));
  const input = document.querySelector("#scanner-manual-input") as HTMLInputElement;
  fireEvent.change(input, { target: { value: hash } });
  fireEvent.click(screen.getByRole("button", { name: /validate & check-in pass/i }));
}

describe("CheckInScanner honest record", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("routes supervisor override through the verify API as a re-admit", async () => {
    const calls = mockVerifySequence([doubleResponse, { ...admittedResponse, reEntryOverridden: true }]);
    render(<CheckInScanner />);
    await submitManualHash("HASH-DOUBLE-1");
    await waitFor(() => {
      expect(screen.getAllByText(/already admitted/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole("button", { name: /supervisor override/i })[0]);
    await waitFor(() => {
      expect(calls.length).toBe(2);
    });
    expect(calls[1].supervisorOverride).toBe(true);
    expect(calls[1].qrCodeHash).toBe("HASH-DOUBLE-1");
    await waitFor(() => {
      expect(screen.getAllByText(/override recorded/i).length).toBeGreaterThan(0);
    });
  });

  it("partitions simulator rows as training, excluded from counts and CSV", async () => {
    mockVerifySequence([admittedResponse]);
    const { container } = render(<CheckInScanner />);
    fireEvent.click(screen.getByRole("button", { name: /scenarios/i }));
    fireEvent.click(screen.getByRole("button", { name: /valid pass/i }));
    await waitFor(() => {
      expect(screen.getAllByText("Training").length).toBeGreaterThan(0);
    });
    // Telemetry excludes training rows
    const processed = container.querySelector("[data-testid='telemetry-processed']");
    expect(processed?.textContent).toBe("0");
  });

  it("confirms simulator injection once a real shift is underway", async () => {
    mockVerifySequence([admittedResponse]);
    render(<CheckInScanner />);
    await submitManualHash("HASH-REAL-1");
    await waitFor(() => {
      expect(screen.getAllByText("Amelia Hartono").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /scenarios/i }));
    fireEvent.click(screen.getByRole("button", { name: /^valid pass$/i }));
    await waitFor(() => {
      expect(screen.getByText(/inject a training scan/i)).toBeInTheDocument();
    });
  });
});
