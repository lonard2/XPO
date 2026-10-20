import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrganizerEventsRoster } from "@/components/organizer/OrganizerEventsRoster";

const item: any = {
  id: "ev-1",
  slug: "expo-one",
  title: "Expo One",
  tagline: "First expo",
  description: "Description one.",
  archetype: "INDUSTRIAL_B2B",
  format: "IN_PERSON",
  scale: "LARGE",
  regionId: "id",
  startDate: "2027-05-01T09:00:00.000Z",
  endDate: "2027-05-03T18:00:00.000Z",
  venue: { id: "v-1", name: "JIExpo" },
  venueHall: { id: "h-1", name: "Hall A" },
  venueHallIds: JSON.stringify(["h-1", "h-2"]),
  organizerId: "org-1",
  bookings: [],
  booths: [],
  ticketTiers: [
    { id: "t1", name: "Standard", price: 100000, currency: "IDR", capacity: 500, benefitsJson: JSON.stringify(["Floor Access"]) },
  ],
};

describe("OrganizerEventsRoster duplicate", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stages a titled copy in the wizard draft on Duplicate", async () => {
    render(<OrganizerEventsRoster events={[item]} locale="en" />);
    await waitFor(() => {
      expect(screen.getByText("Expo One")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /duplicate/i }));
    const raw = localStorage.getItem("xpo_wizard_draft_v1");
    expect(raw).not.toBeNull();
    const draft = JSON.parse(raw!);
    expect(draft.title).toBe("Expo One (Copy)");
    expect(draft.slug).toBe("");
    expect(draft.venueId).toBe("v-1");
    expect(draft.venueHallIds).toEqual(["h-1", "h-2"]);
    expect(draft.startDate).toBe("2027-05-01");
    expect(draft.ticketTiers[0].name).toBe("Standard");
    expect(draft.ticketTiers[0].benefits).toContain("Floor Access");
  });
});
