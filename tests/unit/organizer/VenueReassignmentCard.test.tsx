import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VenueReassignmentCard } from "@/components/organizer/VenueReassignmentCard";

const venues = [
  {
    id: "v1", name: "JIExpo Kemayoran", city: "Jakarta", regionId: "id",
    type: "CONVENTION_CENTER", size: "LARGE",
    halls: [
      { id: "h1", name: "Hall A1", kind: "HALL", capacity: 5000 },
      { id: "h2", name: "Hall A2", kind: "HALL", capacity: 4000 },
    ],
  },
  {
    id: "v2", name: "Tokyo Big Sight", city: "Tokyo", regionId: "jp",
    type: "EXHIBITION_CENTER", size: "MEDIUM",
    halls: [
      { id: "h3", name: "Hall B1", kind: "HALL", capacity: 3000 },
      { id: "h4", name: "Hall B2", kind: "HALL", capacity: 2500 },
    ],
  },
];

const props = {
  eventId: "evt-1",
  locale: "en",
  eventSlug: "indonesia-green-energy-2027",
  currentVenue: { id: "v1", name: "JIExpo Kemayoran", regionId: "id", type: "CONVENTION_CENTER" },
  currentHallIds: ["h1"],
};

function mockFetch(putBody: unknown[] = []) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      putBody.push(JSON.parse(String(init.body)));
      return {
        ok: true,
        json: async () => ({
          success: true,
          event: {
            venue: { id: "v2", name: "Tokyo Big Sight" },
            venueHall: { id: "h3", name: "Hall B1" },
            regionId: "jp",
            venueHallIds: JSON.stringify(["h3"]),
          },
        }),
      };
    }
    return { ok: true, json: async () => ({ success: true, venues }) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("VenueReassignmentCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("resets spaces to the new venue and names the edition move", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    const select = await screen.findByLabelText(/^venue$/i);
    fireEvent.change(select, { target: { value: "v2" } });

    expect(screen.getByText(/Indonesia edition to the Japan edition/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/Hall B1/) as HTMLInputElement).checked).toBe(true);
    expect(screen.queryByLabelText(/Hall A1/)).toBeNull();
  });

  it("saves the venue and its spaces through the venue endpoint", async () => {
    const bodies: unknown[] = [];
    mockFetch(bodies);
    const onSaved = vi.fn();
    render(<VenueReassignmentCard {...props} onSaved={onSaved} />);

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });
    fireEvent.click(screen.getByRole("button", { name: /save venue/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reassign venue/i }));
    });

    expect(bodies).toEqual([{ venueId: "v2", venueHallIds: ["h3"] }]);
    expect(onSaved).toHaveBeenCalled();
    expect(await screen.findByText(/venue updated/i)).toBeInTheDocument();
  });

  it("keeps saving disabled until something changes", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    await screen.findByLabelText(/^venue$/i);
    expect(screen.getByRole("button", { name: /save venue/i })).toBeDisabled();
  });

  it("warns with a count when booth or agenda text names the previous venue", async () => {
    mockFetch();
    render(
      <VenueReassignmentCard
        {...props}
        booths={[{ hallName: "Hall A1" }]}
        agendaItems={[{ location: "Main Stage - Hall A1" }]}
      />
    );

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });

    expect(screen.getByText(/space names may be stale/i)).toBeInTheDocument();
    expect(screen.getByTestId("stale-hall-count")).toHaveTextContent("2");
  });

  it("refuses to save with no space selected", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });
    fireEvent.click(screen.getByLabelText(/Hall B1/));

    expect(screen.getByRole("button", { name: /save venue/i })).toBeDisabled();
  });

  it("keeps the stale warning and its links after saving", async () => {
    const bodies: unknown[] = [];
    mockFetch(bodies);
    render(
      <VenueReassignmentCard
        {...props}
        booths={[{ hallName: "Hall A1" }]}
        agendaItems={[{ location: "Main Stage - Hall A1" }]}
      />
    );

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });
    fireEvent.click(screen.getByRole("button", { name: /save venue/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reassign venue/i }));
    });

    expect(await screen.findByText(/venue updated/i)).toBeInTheDocument();
    expect(screen.getByText(/space names may be stale/i)).toBeInTheDocument();
    expect(screen.getByTestId("stale-hall-count")).toHaveTextContent("2");
    expect(screen.getByRole("link", { name: /open the booth manager/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open event updates/i })).toBeInTheDocument();
  });

  it("shows the saved venue and region in the summary after saving", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    fireEvent.change(await screen.findByLabelText(/^venue$/i), { target: { value: "v2" } });
    fireEvent.click(screen.getByRole("button", { name: /save venue/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reassign venue/i }));
    });

    expect(await screen.findByText(/venue updated/i)).toBeInTheDocument();
    expect(screen.getByText("Tokyo Big Sight")).toBeInTheDocument();
    expect(screen.getByText("Japan")).toBeInTheDocument();
  });

  it("groups venues by region and shows each venue type", async () => {
    mockFetch();
    render(<VenueReassignmentCard {...props} />);

    const select = await screen.findByLabelText(/^venue$/i);
    const groups = select.querySelectorAll("optgroup");

    expect(groups).toHaveLength(2);
    expect(groups[0].getAttribute("label")).toBe("Indonesia");
    expect(groups[1].getAttribute("label")).toBe("Japan");
    expect(
      screen.getByRole("option", { name: /Tokyo Big Sight.*Exhibition Center/i })
    ).toBeInTheDocument();
  });
});
