import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  MeetingRequestInbox,
  type MeetingRequestRow,
} from "@/components/organizer/MeetingRequestInbox";

const pendingRow: MeetingRequestRow = {
  id: "mr-1",
  type: "DEAL_SLOT",
  requesterName: "Buyer One",
  requesterEmail: "buyer@example.com",
  target: "Apex Robotics",
  slot: "Morning",
  message: "Interested",
  status: "PENDING",
  scheduledAt: null,
  location: "",
  booking: {
    id: "b-1",
    status: "CONFIRMED",
    attendeeName: "Buyer One",
    ticketTier: { id: "t-1", name: "Delegate Pass" },
  },
  booth: { id: "booth-1", companyName: "Apex Robotics", boothNumber: "C-9", hallName: "Hall C" },
  requesterInterests: ["TECH_DEV_SUMMIT"],
  createdAt: new Date("2027-09-01T10:00:00Z"),
  event: { id: "e-1", title: "Cycle Event", slug: "cycle-event" },
};

const confirmedRow: MeetingRequestRow = {
  ...pendingRow,
  id: "mr-2",
  status: "CONFIRMED",
  scheduledAt: "2027-10-02T10:30:00.000Z",
  location: "Hall A1",
};

function mockPatch(response: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  }) as any;
}

describe("MeetingRequestInbox scheduling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the linked pass, booth, and interests on each row", () => {
    render(<MeetingRequestInbox initialRequests={[pendingRow]} />);

    expect(screen.getByText(/Delegate Pass/)).toBeInTheDocument();
    expect(screen.getAllByText(/Apex Robotics/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Interests/)).toBeInTheDocument();
  });

  it("confirms with the entered time and location", async () => {
    mockPatch({ request: { scheduledAt: "2027-10-02T10:30:00.000Z", location: "Hall A1" } });
    render(<MeetingRequestInbox initialRequests={[pendingRow]} />);

    fireEvent.change(screen.getByLabelText(/Date and time/i), {
      target: { value: "2027-10-02T10:30" },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: "Hall A1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Accept/i }));

    await waitFor(() => {
      const [, init] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.status).toBe("CONFIRMED");
      expect(body.scheduledAt).toContain("2027-10-02");
      expect(body.location).toBe("Hall A1");
    });
  });

  it("displays the schedule on a confirmed row and reschedules it", async () => {
    mockPatch({ request: { scheduledAt: "2027-10-02T14:00:00.000Z", location: "Hall B2" } });
    render(<MeetingRequestInbox initialRequests={[confirmedRow]} />);

    expect(screen.getByText(/Hall A1/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Change time or location/i));
    fireEvent.change(screen.getByLabelText(/Date and time/i), {
      target: { value: "2027-10-02T14:00" },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: "Hall B2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save schedule/i }));

    await waitFor(() => {
      const [, init] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.status).toBeUndefined();
      expect(body.location).toBe("Hall B2");
    });
  });
});
