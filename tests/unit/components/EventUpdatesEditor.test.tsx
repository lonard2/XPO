import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventUpdatesEditor } from "@/components/organizer/EventUpdatesEditor";

const drafts = [
  {
    id: "upd-01",
    eventId: "evt-01",
    title: "Doors open early",
    body: "Gates at 8.",
    status: "DRAFT",
    approvedBy: null,
    approvedAt: null,
    updatedAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "upd-02",
    eventId: "evt-01",
    title: "Lineup drop",
    body: "Acts announced.",
    status: "APPROVED",
    approvedBy: "admin-1",
    approvedAt: "2026-11-02T00:00:00Z",
    updatedAt: "2026-11-02T00:00:00Z",
  },
];

function mockFetchQueue(responses: Array<unknown>) {
  const queue = [...responses];
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => queue.shift() ?? { success: true },
    }))
  );
}

describe("Component: EventUpdatesEditor", () => {
  beforeEach(() => {
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists drafts with status and keeps approved copy read-only", async () => {
    mockFetchQueue([{ success: true, updates: drafts }]);
    render(<EventUpdatesEditor eventId="evt-01" />);

    expect(await screen.findByText("Doors open early")).toBeDefined();
    expect(screen.getByText("Lineup drop")).toBeDefined();
    expect(screen.getByText(/edits need re-approval/i)).toBeDefined();
  });

  it("creates an update through the organizer endpoint", async () => {
    mockFetchQueue([
      { success: true, updates: [] },
      {
        success: true,
        update: { ...drafts[0], id: "upd-03", title: "Fresh news" },
      },
    ]);
    render(<EventUpdatesEditor eventId="evt-01" />);
    await screen.findByText(/no updates yet/i);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Fresh news" },
    });
    fireEvent.change(screen.getByLabelText(/body/i), {
      target: { value: "Something happened." },
    });
    fireEvent.click(screen.getByRole("button", { name: /publish update|post update|add update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/organizer/events/evt-01/updates",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(await screen.findByText("Fresh news")).toBeDefined();
  });

  it("deletes through the endpoint after confirm", async () => {
    mockFetchQueue([
      { success: true, updates: [drafts[0]] },
      { success: true },
    ]);
    render(<EventUpdatesEditor eventId="evt-01" />);
    await screen.findByText("Doors open early");

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/organizer/events/evt-01/updates/upd-01",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
