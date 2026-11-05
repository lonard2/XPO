import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { BannerTemporalWidget } from "@/components/discovery/BannerCarousel";

const START = "2027-04-14T09:00:00.000Z";
const END = "2027-04-17T18:00:00.000Z";

afterEach(() => {
  vi.useRealTimers();
});

describe("BannerTemporalWidget hydration safety", () => {
  it("renders identical server markup at two moments", () => {
    // The countdown used to be computed during render, so the server shipped a
    // seconds value that never matched the client's. Two renders two seconds apart
    // must produce the same HTML for hydration to be able to match.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T10:00:00.000Z"));
    const first = renderToString(
      <BannerTemporalWidget startDate={START} endDate={END} />
    );

    vi.setSystemTime(new Date("2026-10-31T10:00:02.000Z"));
    const second = renderToString(
      <BannerTemporalWidget startDate={START} endDate={END} />
    );

    expect(first).toBe(second);
  });

  it("still shows a live countdown once mounted on the client", async () => {
    render(<BannerTemporalWidget startDate={START} endDate={END} />);

    await waitFor(() => {
      expect(screen.getByText(/\d+d \d+h \d+m/)).toBeDefined();
    });
    // Seconds ticked every second for an event days away: false precision.
    expect(screen.queryByText(/\d+d \d+h \d+m \d+s/)).toBeNull();
  });
});
