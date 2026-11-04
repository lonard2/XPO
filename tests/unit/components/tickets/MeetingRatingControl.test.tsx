import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MeetingRatingControl } from "@/components/tickets/MeetingRatingControl";

describe("MeetingRatingControl", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ request: { id: "mr-1", rating: 4 } }),
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the chosen stars and shows the saved rating", async () => {
    render(<MeetingRatingControl requestId="mr-1" initialRating={null} />);

    fireEvent.click(screen.getByRole("button", { name: "4 / 5" }));

    await waitFor(() => {
      const [, init] = (global.fetch as any).mock.calls[0];
      expect(JSON.parse(init.body)).toEqual({ rating: 4 });
    });
    expect(screen.getByText(/Rated 4 out of 5/)).toBeInTheDocument();
  });

  it("renders an existing rating without asking again", () => {
    render(<MeetingRatingControl requestId="mr-1" initialRating={5} />);
    expect(screen.getByText(/Rated 5 out of 5/)).toBeInTheDocument();
  });
});
