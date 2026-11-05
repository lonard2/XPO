import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  AdminEventsConsoleClient,
  type AdminEventItem,
} from "@/components/admin/AdminEventsConsoleClient";

const row: AdminEventItem = {
  id: "evt-blurb-01",
  slug: "flagship-expo-2026",
  title: "Flagship Expo 2026",
  archetype: "INDUSTRIAL_B2B",
  startDate: "2026-09-14T09:00:00Z",
  endDate: "2026-09-17T18:00:00Z",
  organizerId: null,
  isPlatformCurated: true,
  venue: { name: "JIExpo Kemayoran", city: "Jakarta" },
  editorialBlurb: "Editors pick: the flagship automation expo.",
  editorialBlurbI18n: { id: "Pilihan editor." },
  editorialApproved: true,
};

describe("Component: AdminEventsConsole editorial editor", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          event: { ...row, editorialBlurb: "Saved line." },
          message: "saved",
        }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the blurb editor prefilled with default, locales, and approval", () => {
    render(
      <AdminEventsConsoleClient initialEvents={[row]} locale="en" isLive={true} />
    );

    fireEvent.click(screen.getByRole("button", { name: /editorial/i }));
    expect(screen.getByLabelText(/default blurb/i)).toHaveValue(
      "Editors pick: the flagship automation expo."
    );
    expect(
      (document.getElementById("blurb-id") as HTMLTextAreaElement).value
    ).toBe("Pilihan editor.");
    expect(screen.getByLabelText(/approved/i)).toBeChecked();
  });

  it("saves through the blurb endpoint with the Task 3 body shape", async () => {
    render(
      <AdminEventsConsoleClient initialEvents={[row]} locale="en" isLive={true} />
    );

    fireEvent.click(screen.getByRole("button", { name: /editorial/i }));
    fireEvent.change(screen.getByLabelText(/default blurb/i), {
      target: { value: "Saved line." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/admin/events/${row.id}/blurb`,
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining("Saved line."),
        })
      );
    });
    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls as Array<
      [string, RequestInit?]
    >;
    const blurbCall = calls.find(([url]) => String(url).includes("/blurb"));
    expect(blurbCall).toBeDefined();
    const body = JSON.parse(blurbCall![1]?.body as string);
    expect(body).toEqual({
      editorialBlurb: "Saved line.",
      editorialBlurbI18n: expect.objectContaining({ id: "Pilihan editor." }),
      editorialApproved: true,
    });
  });

  it("disables the editor with an explanatory note in preview mode", () => {
    render(
      <AdminEventsConsoleClient initialEvents={[row]} locale="en" isLive={false} />
    );

    expect(screen.getByRole("button", { name: /editorial/i })).toBeDisabled();
    expect(screen.getByText(/preview data is read-only/i)).toBeDefined();
  });
});
