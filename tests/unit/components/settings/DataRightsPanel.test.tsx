import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DataRightsPanel } from "@/components/settings/DataRightsPanel";

describe("DataRightsPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks visitors to sign in instead of showing dead buttons", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    render(<DataRightsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Sign in to download/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Download my data/)).toBeNull();
  });

  it("erases only after an explicit second confirmation", async () => {
    const calls: any[] = [];
    global.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
      calls.push([url, init]);
      if (url === "/api/auth/me") return Promise.resolve({ ok: true });
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            erased: { bookings: 1, meetingRequests: 1, waitlistEntries: 0, boothClaims: 0 },
          }),
      });
    }) as any;

    render(<DataRightsPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Download my data/)).toBeInTheDocument();
    });

    // First click only arms; nothing is sent yet.
    fireEvent.click(screen.getByRole("button", { name: /Delete my data/i }));
    expect(screen.getByRole("button", { name: /Yes, erase everything/i })).toBeInTheDocument();
    expect(calls.filter(([url]) => url === "/api/profile/erase")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /Yes, erase everything/i }));
    await waitFor(() => {
      expect(screen.getByText(/erased across 2 records/i)).toBeInTheDocument();
    });
    const [, init] = calls.find(([url]) => url === "/api/profile/erase")!;
    expect(JSON.parse(init.body)).toEqual({ confirm: "DELETE" });
  });
});
