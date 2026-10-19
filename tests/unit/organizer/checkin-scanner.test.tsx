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

  it("confirms simulator injection once a real shift is underway", async () => {    mockVerifySequence([admittedResponse]);
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

describe("CheckInScanner event scope", () => {
  const ownedEvents = [
    { id: "ev-9", title: "Expo Nine", organizerId: "cmt2sfr7n0000laeaurwdwe44", venueHall: { name: "Hall A" } },
    { id: "ev-10", title: "Expo Ten", organizerId: "cmt2sfr7n0000laeaurwdwe44", venueHall: { name: "Hall B" } },
  ];

  function mockScannerApis(verifyImpl: (body: any) => any) {
    const calls: any[] = [];
    global.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
      if (url.includes("/api/organizer/events")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ events: ownedEvents }) });
      }
      const body = JSON.parse(init.body);
      calls.push(body);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(verifyImpl(body)) });
    }) as any;
    return calls;
  }

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("banners the deep-linked event and sends its id on verify", async () => {
    const calls = mockScannerApis(() => ({ ...admittedResponse }));
    render(<CheckInScanner defaultEventId="ev-9" />);
    await waitFor(() => {
      expect(screen.getByText('Scanning for:')).toBeInTheDocument();
      expect(screen.getByText('Expo Nine · Hall A')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /manual code entry/i }));
    fireEvent.change(document.querySelector("#scanner-manual-input") as HTMLInputElement, {
      target: { value: "HASH-EV-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /validate & check-in pass/i }));
    await waitFor(() => {
      expect(calls.length).toBe(1);
    });
    expect(calls[0].eventId).toBe("ev-9");
  });

  it("switches scanning context through the event selector", async () => {
    mockScannerApis(() => ({ ...admittedResponse }));
    render(<CheckInScanner defaultEventId="ev-9" />);
    await waitFor(() => {
      expect(screen.getByText('Scanning for:')).toBeInTheDocument();
      expect(screen.getByText('Expo Nine · Hall A')).toBeInTheDocument();
    });
    const select = screen.getByLabelText(/scanning event/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "ev-10" } });
    await waitFor(() => {
      expect(screen.getByText('Expo Ten · Hall B')).toBeInTheDocument();
    });
  });

  it("shows a wrong-event verdict when the server reports a mismatch", async () => {
    mockScannerApis(() => ({ valid: false, error: "EVENT_MISMATCH: Pass belongs to a different event" }));
    render(<CheckInScanner defaultEventId="ev-9" />);
    await waitFor(() => {
      expect(screen.getByText('Scanning for:')).toBeInTheDocument();
      expect(screen.getByText('Expo Nine · Hall A')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /manual code entry/i }));
    fireEvent.change(document.querySelector("#scanner-manual-input") as HTMLInputElement, {
      target: { value: "HASH-WRONG-EV" },
    });
    fireEvent.click(screen.getByRole("button", { name: /validate & check-in pass/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/wrong event/i).length).toBeGreaterThan(0);
    });
  });
});

describe("CheckInScanner recognition", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders affiliation, photo, and perk descriptions when provided", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            valid: true,
            alreadyCheckedIn: false,
            status: "CHECKED_IN",
            checkedInAt: new Date().toISOString(),
            attendee: { name: "Amelia Hartono", email: "amelia@xpo.com", company: "Nusantara Labs", photo: "https://xpo.test/amelia.png" },
            ticketTier: { id: "t1", name: "Standard Pass" },
            event: { id: "ev-9", title: "Expo Nine" },
            perks: [{ id: "p1", title: "Welcome Kit", description: "Collect at Counter 3" }],
          }),
      })
    ) as any;
    render(<CheckInScanner />);
    fireEvent.click(screen.getByRole("button", { name: /manual code entry/i }));
    fireEvent.change(document.querySelector("#scanner-manual-input") as HTMLInputElement, {
      target: { value: "HASH-AFFIL-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /validate & check-in pass/i }));
    await waitFor(() => {
      expect(screen.getAllByText("Nusantara Labs").length).toBeGreaterThan(0);
    });
    expect(screen.getByAltText(/amelia hartono/i)).toBeInTheDocument();
    expect(screen.getByText("Collect at Counter 3")).toBeInTheDocument();
  });
});
