import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MeetingAnalyticsStrip } from "@/components/organizer/MeetingAnalyticsStrip";

const analytics = {
  requested: 5,
  pending: 2,
  confirmed: 2,
  declined: 1,
  held: 1,
  noShow: 0,
  awaitingOutcome: 1,
  ratedCount: 1,
  avgRating: 5,
  tiers: [{ tierId: "tier-1", name: "Hosted Pass", quota: 1, confirmed: 1 }],
  unlinkedConfirmed: 1,
};

describe("MeetingAnalyticsStrip", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
      if (url === "/api/meetings/analytics") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, analytics }),
        });
      }
      if (url === "/api/organizer/tiers/tier-1" && init?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tier: { id: "tier-1", meetingQuota: 2 } }),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the funnel and the per-tier quota usage", async () => {
    render(<MeetingAnalyticsStrip />);

    await waitFor(() => {
      expect(screen.getByText("Hosted-buyer funnel")).toBeInTheDocument();
    });
    expect(screen.getByText(/Requested: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Held: 1/)).toBeInTheDocument();
    expect(screen.getByText("Hosted Pass")).toBeInTheDocument();
    expect(screen.getByText(/1\/1/)).toBeInTheDocument();
    expect(screen.getByText(/outside quotas/)).toBeInTheDocument();
  });

  it("saves an edited quota through the tier route", async () => {
    render(<MeetingAnalyticsStrip />);

    await waitFor(() => {
      expect(screen.getByText("Hosted Pass")).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/Quota: Hosted Pass/i);
    fireEvent.change(input, { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      const tierCall = (global.fetch as any).mock.calls.find(
        ([url, init]: any[]) => url === "/api/organizer/tiers/tier-1" && init?.method === "PATCH"
      );
      expect(tierCall).toBeDefined();
      expect(JSON.parse(tierCall[1].body)).toEqual({ meetingQuota: 2 });
    });
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });
});
