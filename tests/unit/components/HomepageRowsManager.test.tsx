import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { HomepageRowsManager } from "@/components/admin/HomepageRowsManager";

const rows = [
  {
    id: "row-1",
    title: "Energy transition week",
    subtitle: "Grids and storage",
    titleI18n: null,
    subtitleI18n: null,
    regionId: "id",
    position: 0,
    eventIdsJson: JSON.stringify(["evt-1"]),
    isActive: true,
  },
  {
    id: "row-2",
    title: "Robotics week",
    subtitle: null,
    titleI18n: null,
    subtitleI18n: null,
    regionId: "id",
    position: 1,
    eventIdsJson: JSON.stringify(["evt-2"]),
    isActive: true,
  },
];

const candidates = [
  { id: "evt-1", title: "Grid Expo 2026", startDate: "2026-12-01T09:00:00Z", regionId: "id" },
  { id: "evt-2", title: "Storage Summit 2026", startDate: "2026-12-05T09:00:00Z", regionId: "id" },
];

function routeFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      const u = String(url);
      if (u.includes("/reorder")) {
        return { ok: true, json: async () => ({ success: true, rows }) };
      }
      if (options?.method === "DELETE") {
        return { ok: true, json: async () => ({ success: true }) };
      }
      if (options?.method === "POST" || options?.method === "PUT") {
        return { ok: true, json: async () => ({ success: true, row: rows[0] }) };
      }
      return { ok: true, json: async () => ({ success: true, rows, candidates }) };
    })
  );
}

describe("Component: HomepageRowsManager", () => {
  beforeEach(() => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    routeFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists rows for the active scope", async () => {
    render(<HomepageRowsManager locale="en" />);
    expect(await screen.findByText("Energy transition week")).toBeDefined();
    expect(screen.getByText(/Grids and storage/)).toBeDefined();
  });

  it("creates a row with the chosen events", async () => {
    render(<HomepageRowsManager locale="en" />);
    await screen.findByText("Energy transition week");

    fireEvent.click(screen.getByRole("button", { name: /new row/i }));
    fireEvent.change(screen.getByLabelText(/^title$/i), {
      target: { value: "Robotics week" },
    });
    fireEvent.click(screen.getByLabelText(/Storage Summit 2026/i));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/homepage-rows",
        expect.objectContaining({ method: "POST" })
      );
    });
    const post = (fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([url, opts]) =>
        url === "/api/admin/homepage-rows" && (opts as RequestInit)?.method === "POST"
    );
    const body = JSON.parse((post![1] as RequestInit).body as string);
    expect(body.title).toBe("Robotics week");
    expect(body.eventIds).toContain("evt-2");
  });

  it("reorders and deletes through the endpoints", async () => {
    render(<HomepageRowsManager locale="en" />);
    await screen.findByText("Energy transition week");

    fireEvent.click(screen.getAllByRole("button", { name: /move down/i })[0]);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/homepage-rows/reorder",
        expect.objectContaining({ method: "PUT" })
      );
    });

    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/admin/homepage-rows/row-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});

describe("Quality Gate: homepage editor rows", () => {
  const page = readFileSync("src/app/[locale]/(attendee)/page.tsx", "utf8");

  it("merges scopes and delegates resolution to the tested helper", () => {
    expect(page).toContain("mergeRows");
    expect(page).toContain("resolveEditorRows");
    expect(page).toContain("homepageRow");
    expect(page).toContain("listingWhere");
  });
});
