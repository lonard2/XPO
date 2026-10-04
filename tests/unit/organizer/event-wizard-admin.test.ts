import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewEventWizardPage from "@/app/[locale]/(organizer)/events/new/page";

// Auth session mocking
let mockRole: "ADMIN" | "ORGANIZER" | "ATTENDEE" = "ADMIN";
let mockUser = {
  id: "usr-admin-1",
  email: "admin@xpo.com",
  name: "Platform Admin",
  role: "ADMIN" as const,
};

vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      role: mockRole,
      switchRole: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: () => true,
    }),
  };
});

describe("Admin Platform-Curated Event Launch Wizard", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    mockRole = "ADMIN";
    mockUser = {
      id: "usr-admin-1",
      email: "admin@xpo.com",
      name: "Platform Admin",
      role: "ADMIN",
    };

    fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/venues") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              venues: [
                {
                  id: "v-jiexpo",
                  name: "JIExpo Kemayoran",
                  regionId: "id",
                  city: "Jakarta Pusat",
                  halls: [{ id: "h-jiexpo-a1", name: "Hall A1", capacity: 5000 }],
                },
              ],
            }),
        });
      }

      if (url === "/api/organizer/events") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              event: { id: "evt-curated-123", slug: "test-event" },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    global.fetch = fetchMock;
  });

  it("renders the Event Publication Authority and Ownership section for ADMIN role", async () => {
    mockRole = "ADMIN";
    mockUser.role = "ADMIN";

    render(React.createElement(NewEventWizardPage));

    await waitFor(() => {
      expect(
        screen.getByText("Event Publication Authority & Ownership")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Platform-Curated / Official Venue Listing")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Assign to Registered Organizer")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Appears as an official exhibition listing with a verified badge. Does not hijack or bind to registered tenant accounts."
      )
    ).toBeInTheDocument();

    const organizerNameInput = screen.getByPlaceholderText(
      "e.g. Jakarta International Expo, Debindo ITE, GAIKINDO"
    );
    expect(organizerNameInput).toBeInTheDocument();
  });

  it("does not render Event Publication Authority section for ORGANIZER role", async () => {
    mockRole = "ORGANIZER";
    mockUser.role = "ORGANIZER";

    render(React.createElement(NewEventWizardPage));

    await waitFor(() => {
      expect(screen.getByText("Create & Launch MICE Exhibition")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("Event Publication Authority & Ownership")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Platform-Curated / Official Venue Listing")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText(
        "e.g. Jakarta International Expo, Debindo ITE, GAIKINDO"
      )
    ).not.toBeInTheDocument();
  });

  it("toggles between platform curated listing and organizer assignment", async () => {
    mockRole = "ADMIN";
    mockUser.role = "ADMIN";

    render(React.createElement(NewEventWizardPage));

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: /platform-curated/i })).toBeInTheDocument();
    });

    // Platform curated should be selected by default
    const platformRadio = screen.getByRole("radio", {
      name: /platform-curated/i,
    });
    const assignRadio = screen.getByRole("radio", {
      name: /assign to registered organizer/i,
    });

    expect(platformRadio).toHaveAttribute("aria-checked", "true");
    expect(assignRadio).toHaveAttribute("aria-checked", "false");

    // Click assign option
    fireEvent.click(assignRadio);

    expect(platformRadio).toHaveAttribute("aria-checked", "false");
    expect(assignRadio).toHaveAttribute("aria-checked", "true");

    // Target organizer input should appear
    const targetInput = screen.getByLabelText(/target organizer account id/i);
    expect(targetInput).toBeInTheDocument();

    // Click back to platform curated
    fireEvent.click(platformRadio);
    expect(platformRadio).toHaveAttribute("aria-checked", "true");
    expect(assignRadio).toHaveAttribute("aria-checked", "false");
  });

  it("includes isPlatformCurated: true and organizerName in POST payload when admin creates platform event", async () => {
    mockRole = "ADMIN";
    mockUser.role = "ADMIN";

    const { container } = render(React.createElement(NewEventWizardPage));

    // Fill Step 1 required fields
    const titleInput = container.querySelector("#wizard-event-title") as HTMLInputElement;
    fireEvent.change(titleInput, {
      target: { value: "Indonesia Mining & Energy Expo 2027" },
    });

    const descInput = container.querySelector("#wizard-description") as HTMLTextAreaElement;
    fireEvent.change(descInput, {
      target: { value: "Major international trade fair for green energy and mining." },
    });

    // Enter organizer name
    const orgNameInput = screen.getByPlaceholderText(
      "e.g. Jakarta International Expo, Debindo ITE, GAIKINDO"
    );
    fireEvent.change(orgNameInput, {
      target: { value: "Debindo ITE Exhibitions" },
    });

    // Advance Step 1 -> Step 2
    const nextBtn = screen.getByRole("button", { name: /continue to next step/i });
    fireEvent.click(nextBtn);

    // Advance Step 2 -> Step 3
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to next step/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to next step/i }));

    // Advance Step 3 -> Step 4
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to next step/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to next step/i }));

    // Step 4: Launch Event
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish & launch exhibition/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /publish & launch exhibition/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/organizer/events",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    const postCall = fetchMock.mock.calls.find((call) => call[0] === "/api/organizer/events");
    expect(postCall).toBeDefined();
    const payload = JSON.parse(postCall![1].body);

    expect(payload.isPlatformCurated).toBe(true);
    expect(payload.organizerName).toBe("Debindo ITE Exhibitions");
    expect(payload.organizerId).toBeUndefined();
  });

  it("includes isPlatformCurated: false and organizerId in POST payload when admin assigns event", async () => {
    mockRole = "ADMIN";
    mockUser.role = "ADMIN";

    const { container } = render(React.createElement(NewEventWizardPage));

    // Fill Step 1 required fields
    const titleInput = container.querySelector("#wizard-event-title") as HTMLInputElement;
    fireEvent.change(titleInput, {
      target: { value: "Automotive World Jakarta 2027" },
    });

    const descInput = container.querySelector("#wizard-description") as HTMLTextAreaElement;
    fireEvent.change(descInput, {
      target: { value: "Electric mobility and automotive parts show." },
    });

    // Select assign to organizer
    const assignRadio = screen.getByRole("radio", {
      name: /assign to registered organizer/i,
    });
    fireEvent.click(assignRadio);

    // Enter target organizer ID
    const targetInput = screen.getByLabelText(/target organizer account id/i);
    fireEvent.change(targetInput, {
      target: { value: "usr-org-debindo-99" },
    });

    // Advance Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /continue to next step/i }));

    // Advance Step 2 -> Step 3
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to next step/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to next step/i }));

    // Advance Step 3 -> Step 4
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to next step/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to next step/i }));

    // Step 4: Launch Event
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /publish & launch exhibition/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /publish & launch exhibition/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/organizer/events",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    const postCall = fetchMock.mock.calls.find((call) => call[0] === "/api/organizer/events");
    expect(postCall).toBeDefined();
    const payload = JSON.parse(postCall![1].body);

    expect(payload.isPlatformCurated).toBe(false);
    expect(payload.organizerId).toBe("usr-org-debindo-99");
  });
});
