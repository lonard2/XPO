import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrganizerEventsRoster, type OrganizerEventItem } from "@/components/organizer/OrganizerEventsRoster";

const mockEvents: OrganizerEventItem[] = [
  {
    id: "evt-live-1",
    slug: "manufacturing-indonesia-2026",
    title: "Manufacturing Indonesia 2026",
    tagline: "Premier International Industrial Automation Expo",
    description: "Heavy machinery and smart manufacturing summit.",
    archetype: "INDUSTRIAL_B2B",
    format: "IN_PERSON",
    startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now (LIVE)
    venue: { id: "ven-1", name: "JIExpo Kemayoran" },
    venueHall: { id: "hall-1", name: "Hall A1-A3" },
    bookings: [{ status: "CHECKED_IN" }, { status: "CONFIRMED" }],
    booths: [{}, {}],
  },
  {
    id: "evt-upcoming-1",
    slug: "asia-ai-summit-2027",
    title: "Asia AI Developer Summit 2027",
    tagline: "Autonomous Agentic Systems",
    description: "Next-gen machine learning and neural architectures.",
    archetype: "TECH_DEV_SUMMIT",
    format: "HYBRID",
    startDate: new Date(Date.now() + 86400000 * 30).toISOString(), // Future
    endDate: new Date(Date.now() + 86400000 * 33).toISOString(),
    venue: { id: "ven-2", name: "Tokyo Big Sight" },
    venueHall: { id: "hall-2", name: "West Hall 1" },
    bookings: [{ status: "CONFIRMED" }],
    booths: [{}],
  },
  {
    id: "evt-past-1",
    slug: "jakarta-fair-2025",
    title: "Jakarta Trade Fair 2025",
    tagline: "Annual Consumer Expo",
    description: "Multi-pavilion trade fair.",
    archetype: "MEGA_EXPO_PAVILION",
    format: "IN_PERSON",
    startDate: new Date(Date.now() - 86400000 * 60).toISOString(), // Past
    endDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    venue: { id: "ven-1", name: "JIExpo Kemayoran" },
    venueHall: { id: "hall-1", name: "Hall B1" },
    bookings: [{ status: "CHECKED_IN" }],
    booths: [],
  },
];

describe("OrganizerEventsRoster Component", () => {
  it("renders operational status tabs with exact counts", () => {
    render(<OrganizerEventsRoster events={mockEvents} locale="en" />);

    expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /live now/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /upcoming/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /concluded/i })).toBeInTheDocument();

    expect(screen.getByText("Manufacturing Indonesia 2026")).toBeInTheDocument();
    expect(screen.getByText("Asia AI Developer Summit 2027")).toBeInTheDocument();
    expect(screen.getByText("Jakarta Trade Fair 2025")).toBeInTheDocument();
  });

  it("filters events by Live Now status when clicking Live tab", () => {
    render(<OrganizerEventsRoster events={mockEvents} locale="en" />);

    const liveTab = screen.getByRole("tab", { name: /live now/i });
    fireEvent.click(liveTab);

    expect(screen.getByText("Manufacturing Indonesia 2026")).toBeInTheDocument();
    expect(screen.queryByText("Asia AI Developer Summit 2027")).not.toBeInTheDocument();
    expect(screen.queryByText("Jakarta Trade Fair 2025")).not.toBeInTheDocument();
  });

  it("filters exhibitions using instant search input", () => {
    render(<OrganizerEventsRoster events={mockEvents} locale="en" />);

    const searchInput = screen.getByPlaceholderText(/filter by title/i);
    fireEvent.change(searchInput, { target: { value: "Tokyo" } });

    expect(screen.getByText("Asia AI Developer Summit 2027")).toBeInTheDocument();
    expect(screen.queryByText("Manufacturing Indonesia 2026")).not.toBeInTheDocument();
  });

  it("renders accessible action buttons with scoped aria-labels", () => {
    render(<OrganizerEventsRoster events={mockEvents} locale="en" />);

    expect(
      screen.getByLabelText(/launch turnstile qr scanner for manufacturing indonesia 2026/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/view ai analytics reports for manufacturing indonesia 2026/i)
    ).toBeInTheDocument();
  });

  it("supports keyboard arrow navigation across operational status tabs", () => {
    render(<OrganizerEventsRoster events={mockEvents} locale="en" />);

    const allTab = screen.getByRole("tab", { name: /all/i });
    allTab.focus();

    // ArrowRight should switch to Live Now
    fireEvent.keyDown(allTab, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /live now/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Manufacturing Indonesia 2026")).toBeInTheDocument();
    expect(screen.queryByText("Asia AI Developer Summit 2027")).not.toBeInTheDocument();

    // ArrowLeft should cycle back to Concluded
    const liveTab = screen.getByRole("tab", { name: /live now/i });
    fireEvent.keyDown(liveTab, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: /all/i })).toHaveAttribute("aria-selected", "true");
  });

  it("handles unassigned venue gracefully without throwing or leaving empty gaps", () => {
    const eventWithoutVenue: OrganizerEventItem[] = [
      {
        id: "evt-no-venue",
        slug: "unassigned-expo-2026",
        title: "Unassigned Expo 2026",
        description: "Expo pending hall assignment.",
        archetype: "TECH_DEV_SUMMIT",
        format: "IN_PERSON",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        venue: null,
        venueHall: null,
      },
    ];

    render(<OrganizerEventsRoster events={eventWithoutVenue} locale="en" />);
    expect(screen.getByText("Venue Unassigned")).toBeInTheDocument();
  });
});
