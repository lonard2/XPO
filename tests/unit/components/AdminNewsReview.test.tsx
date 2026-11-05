import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  AdminEventsConsoleClient,
  type AdminEventItem,
} from "@/components/admin/AdminEventsConsoleClient";

const row: AdminEventItem = {
  id: "evt-news-01",
  slug: "news-expo-2026",
  title: "News Expo 2026",
  archetype: "INDUSTRIAL_B2B",
  startDate: "2026-09-14T09:00:00Z",
  endDate: "2026-09-17T18:00:00Z",
  organizerId: null,
  isPlatformCurated: true,
  venue: { name: "JIExpo Kemayoran", city: "Jakarta" },
};

const pending = [
  {
    id: "upd-p1",
    eventId: "evt-news-01",
    title: "Doors move early",
    body: "Gates at 8.",
    status: "DRAFT",
    event: { id: "evt-news-01", title: "News Expo 2026", regionId: "id" },
  },
];

const slots = [
  {
    id: "slot-1",
    updateId: "upd-p1",
    regionId: "id",
    position: 0,
    update: { id: "upd-p1", title: "Doors move early", event: { title: "News Expo 2026" } },
  },
];

function routeFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      const u = String(url);
      if (u.includes("/api/admin/users")) return { ok: true, json: async () => ({ success: true, users: [] }) };
      if (u.includes("/api/admin/updates?")) return { ok: true, json: async () => ({ success: true, updates: pending }) };
      if (u.match(/\/api\/admin\/updates\/[^/]+$/)) return { ok: true, json: async () => ({ success: true, update: { ...pending[0], status: "APPROVED" } }) };
      if (u.includes("/api/admin/news-slots")) {
        if (options?.method === "PUT") return { ok: true, json: async () => ({ success: true, slots }) };
        return { ok: true, json: async () => ({ success: true, slots: [] }) };
      }
      return { ok: true, json: async () => ({ success: true }) };
    })
  );
}

describe("Component: AdminEventsConsole news review", () => {
  beforeEach(() => {
    routeFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reviews pending updates and approves through the endpoint", async () => {
    render(
      <AdminEventsConsoleClient initialEvents={[row]} locale="en" isLive={true} />
    );

    fireEvent.click(screen.getByRole("tab", { name: /news review/i }));
    // Title appears in the review row (and the slot add-picker option).
    expect((await screen.findAllByText("Doors move early")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/updates/upd-p1",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("saves ordered slots per region through the endpoint", async () => {
    render(
      <AdminEventsConsoleClient initialEvents={[row]} locale="en" isLive={true} />
    );

    fireEvent.click(screen.getByRole("tab", { name: /news review/i }));
    await screen.findAllByText("Doors move early");

    const region = screen.getByLabelText(/slots for region/i);
    expect(region).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /save slots/i }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/news-slots",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  it("disables the review tab with a preview note when offline", () => {
    render(
      <AdminEventsConsoleClient initialEvents={[row]} locale="en" isLive={false} />
    );

    expect(screen.getByRole("tab", { name: /news review/i })).toBeDisabled();
    expect(screen.getAllByText(/preview data is read-only/i).length).toBeGreaterThan(0);
  });
});
