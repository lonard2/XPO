import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BoothManagerPage from "@/app/[locale]/(organizer)/booths/page";

const boothsUrl = "/api/organizer/booths";
const eventsUrl = "/api/organizer/events";

function mockFetch(impl: (url: string, init?: any) => Promise<any>) {
  global.fetch = vi.fn().mockImplementation(impl) as any;
}

const emptyOk = (url: string) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(url.startsWith(eventsUrl) ? { events: [] } : { booths: [] }),
  });

describe("Booth manager data truth", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("badges seeded rows as Sample when the API returns no booths", async () => {
    mockFetch(emptyOk);
    render(<BoothManagerPage />);
    await waitFor(() => {
      expect(screen.getByText(/sample floor data/i)).toBeInTheDocument();
    });
    // Grid view renders one Sample badge per seeded lot, plus the banner badge
    expect(screen.getAllByText("Sample")).toHaveLength(7);
  });

  it("shows a fetch-error banner with Retry when the API is unreachable", async () => {
    mockFetch((url: string) => {
      if (url.startsWith(eventsUrl)) return emptyOk(url);
      return Promise.reject(new Error("network down"));
    });
    render(<BoothManagerPage />);
    await waitFor(() => {
      expect(screen.getByText(/could not reach the database/i)).toBeInTheDocument();
    });
    const retry = screen.getByRole("button", { name: /try again/i });
    expect(retry).toBeInTheDocument();

    // Recover on retry: real row renders with no Sample badges
    mockFetch((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.startsWith(eventsUrl)
              ? { events: [] }
              : {
                  booths: [
                    {
                      id: "b-real-1",
                      eventId: "ev-9",
                      companyName: "Real Tenant Co",
                      boothNumber: "H1 - R01",
                      hallName: "Hall 1",
                    },
                  ],
                }
          ),
      })
    );
    fireEvent.click(retry);
    await waitFor(() => {
      expect(screen.getByText("Real Tenant Co")).toBeInTheDocument();
    });
    expect(screen.queryByText("Sample")).toBeNull();
    expect(screen.queryByText(/sample floor data/i)).toBeNull();
  });

  it("branches the CSV toast to staged-local when the database write is absent", async () => {    mockFetch((url: string, init?: any) => {
      if (url.startsWith(eventsUrl)) return emptyOk(url);
      if (url.startsWith(boothsUrl) && init?.method === "POST") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }
      return emptyOk(url);
    });
    const { container } = render(<BoothManagerPage />);
    await waitFor(() => {
      expect(screen.getByText(/sample floor data/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /import csv/i }));
    const area = container.querySelector("#csv-input-textarea") as HTMLTextAreaElement;
    fireEvent.change(area, {
      target: {
        value: "boothNumber,hallName,companyName,industry,dimensions,areaSqm,boothType,websiteUrl,description\nH9-Z01,Hall 9,Staged Co,Retail,3m x 3m,9,SHELL_SCHEME,,Staged row",
      },
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /import 1 lots/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /import 1 lots/i }));
    await waitFor(() => {
      expect(screen.getByText(/kept on this device only/i)).toBeInTheDocument();
    });
  });

  it("applies validated eventId/hall/status/q deep links on mount", async () => {
    const evId = "ev-9";
    mockFetch((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.startsWith(eventsUrl)
              ? { events: [{ id: evId, title: "Expo Nine" }] }
              : {
                  booths: [
                    { id: "b1", eventId: evId, companyName: "Tenant One", boothNumber: "H9-A", hallName: "Hall 9" },
                    { id: "b2", eventId: evId, companyName: "", boothNumber: "H9-B", hallName: "Hall 9" },
                    { id: "b3", eventId: "ev-other", companyName: "Other Co", boothNumber: "H1-A", hallName: "Hall 1" },
                  ],
                }
          ),
      })
    );
    window.history.replaceState(
      {}, "", `/en/booths?eventId=${evId}&hall=Hall%209&status=AVAILABLE&q=Tenant`
    );
    try {
      const { container } = render(<BoothManagerPage />);
      await waitFor(() => {
        expect((screen.getByLabelText(/registered event/i) as HTMLSelectElement).value).toBe(evId);
      });
      expect((screen.getByLabelText(/exhibition hall/i) as HTMLSelectElement).value).toBe("Hall 9");
      expect((screen.getByLabelText(/all statuses/i) as HTMLSelectElement).value).toBe("AVAILABLE");
      expect((container.querySelector("#booth-search-input") as HTMLInputElement)?.value).toBe("Tenant");
    } finally {
      window.history.replaceState({}, "", "/");
    }
  });

  it("scopes hall pills to the selected event", async () => {
    mockFetch((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.startsWith(eventsUrl)
              ? { events: [{ id: "ev-9", title: "Expo Nine" }] }
              : {
                  booths: [
                    { id: "b1", eventId: "ev-9", companyName: "C1", boothNumber: "N1", hallName: "Hall 9" },
                    { id: "b2", eventId: "ev-other", companyName: "C2", boothNumber: "N2", hallName: "Hall 1" },
                  ],
                }
          ),
      })
    );
    window.history.replaceState({}, "", "/en/booths?eventId=ev-9");
    try {
      const { container } = render(<BoothManagerPage />);
      await waitFor(() => {
        expect((screen.getByLabelText(/registered event/i) as HTMLSelectElement).value).toBe("ev-9");
      });
      const hallOptions = Array.from(
        container.querySelectorAll("#booth-hall-filter option")
      ).map((o) => (o as HTMLOptionElement).value);
      expect(hallOptions).toContain("Hall 9");
      expect(hallOptions).not.toContain("Hall 1");
    } finally {
      window.history.replaceState({}, "", "/");
    }
  });

  it("blocks duplicate booth numbers within the event before submitting", async () => {
    const postSpy = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, booth: {} }) });
    mockFetch((url: string, init?: any) => {
      if (url.startsWith(eventsUrl)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ events: [{ id: "ev-9", title: "Expo Nine" }] }) });
      if (init?.method === "POST") return postSpy(url, init);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ booths: [{ id: "b1", eventId: "ev-9", companyName: "C1", boothNumber: "H9-A", hallName: "Hall 9" }] }),
      });
    });
    const { container } = render(<BoothManagerPage />);
    await waitFor(() => {
      expect(screen.getByText("H9-A")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /add new booth/i }));
    fireEvent.change(container.querySelector("#modal-booth-number") as HTMLInputElement, { target: { value: "h9-a" } });
    fireEvent.change(container.querySelector("#modal-hall-name") as HTMLInputElement, { target: { value: "Hall 9" } });
    fireEvent.click(screen.getByRole("button", { name: /save booth/i }));
    await waitFor(() => {
      expect(screen.getByText(/already allocated for this event/i)).toBeInTheDocument();
    });
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("ignores unknown eventId and hall deep links", async () => {
    mockFetch((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.startsWith(eventsUrl)
              ? { events: [{ id: "ev-9", title: "Expo Nine" }] }
              : { booths: [{ id: "b1", eventId: "ev-9", companyName: "C", boothNumber: "N", hallName: "Hall 9" }] }
          ),
      })
    );
    window.history.replaceState({}, "", "/en/booths?eventId=nope&hall=Nowhere&status=BOGUS");
    try {
      render(<BoothManagerPage />);
      await waitFor(() => {
        expect(screen.getByText("C")).toBeInTheDocument();
      });
      expect((screen.getByLabelText(/registered event/i) as HTMLSelectElement).value).toBe("ALL");
      expect((screen.getByLabelText(/exhibition hall/i) as HTMLSelectElement).value).toBe("ALL");
      expect((screen.getByLabelText(/all statuses/i) as HTMLSelectElement).value).toBe("ALL");
    } finally {
      window.history.replaceState({}, "", "/");
    }
  });
});

describe("listing exclusion from operations", () => {
  const eventsUrl = "/api/organizer/events";

  it("hides listing-only events from the booth event filter", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.startsWith(eventsUrl)
              ? { events: [
                  { id: "ev-9", title: "Expo Nine" },
                  { id: "ev-list", title: "Plain Listing", isListingOnly: true },
                ] }
              : { booths: [] }
          ),
      })
    ) as any;
    const { container } = render(<BoothManagerPage />);
    await waitFor(() => {
      expect(screen.getByText(/sample floor data/i)).toBeInTheDocument();
    });
    const options = Array.from(container.querySelectorAll("#booth-event-filter option")).map(
      (o) => (o as HTMLOptionElement).value
    );
    expect(options).toContain("ev-9");
    expect(options).not.toContain("ev-list");
  });
});

describe("booth KPI truth", () => {
  it("labels the hall count as halls, not exhibitions", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            url.startsWith("/api/organizer/events")
              ? { events: [] }
              : { booths: [] }
          ),
      })
    ) as any;
    render(<BoothManagerPage />);
    await waitFor(() => {
      expect(screen.getByText("Across 3 exhibition halls")).toBeInTheDocument();
    });
    expect(screen.queryByText(/active exhibitions/i)).toBeNull();
  });
});
