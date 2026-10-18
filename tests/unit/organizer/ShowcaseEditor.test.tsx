import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ShowcaseEditor } from "@/components/organizer/ShowcaseEditor";

describe("ShowcaseEditor authoring", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("edits rows and saves valid content to the showcase endpoint", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ShowcaseEditor eventId="evt-1" initialJson={null} />);

    fireEvent.click(screen.getByRole("button", { name: /add row/i }));
    fireEvent.change(screen.getByLabelText("Program title"), {
      target: { value: "Best Demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add alert/i }));
    fireEvent.change(screen.getByLabelText("Alert 1"), {
      target: { value: "Doors open at 08:00" },
    });
    fireEvent.click(screen.getByLabelText(/confirm this content is accurate/i));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save showcase/i }));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/organizer/events/evt-1/showcase",
      expect.objectContaining({ method: "PATCH" })
    );
    const body = JSON.parse((fetchMock.mock.calls[0] as any[])[1].body);
    expect(body.programs).toEqual([
      { kind: "generic", title: "Best Demo", detail: "", sponsor: "" },
    ]);
    expect(body.alerts).toEqual(["Doors open at 08:00"]);
    expect(await screen.findByText(/saved/i)).toBeInTheDocument();
  });

  it("rejects an invalid stream URL before any network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ShowcaseEditor eventId="evt-1" initialJson={null} />);
    fireEvent.click(screen.getByLabelText(/confirm this content is accurate/i));
    fireEvent.change(screen.getByLabelText("Stream URL"), {
      target: { value: "not a url" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save showcase/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires attestation before saving", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ShowcaseEditor eventId="evt-1" initialJson={null} />);
    fireEvent.change(screen.getByLabelText("Stream URL"), {
      target: { value: "https://stream.example.com/live" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save showcase/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("hydrates existing content and caps program rows", () => {
    render(
      <ShowcaseEditor
        eventId="evt-1"
        initialJson={JSON.stringify({
          programs: [{ kind: "bounty", title: "P1", detail: "", sponsor: "" }],
          alerts: ["A1"],
          channels: [{ code: "CH 1", lang: "English", note: "" }],
        })}
      />
    );

    expect(screen.getByDisplayValue("P1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("CH 1")).toBeInTheDocument();
  });
});
