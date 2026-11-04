import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

const serverProfile = {
  fullName: "Server Stored",
  email: "stored@example.com",
  organization: "Match Labs",
  jobTitle: "Buyer",
  interests: ["TECH_DEV_SUMMIT"],
};

const serverSuggestions = [
  {
    event: {
      title: "Asia AI Summit 2026",
      slug: "asia-ai-summit-2026",
      venueName: "ICE BSD City",
      city: "Tangerang",
    },
    score: 2,
    matchedInterests: ["TECH_DEV_SUMMIT"],
  },
];

function mockServer() {
  global.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
    if (url === "/api/profile" && (!init || !init.method)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ profile: serverProfile }) });
    }
    if (url === "/api/profile" && init?.method === "PATCH") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ profile: serverProfile }) });
    }
    if (url === "/api/profile/suggestions") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ suggestions: serverSuggestions }),
      });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  }) as any;
}

describe("ProfileSettingsForm server sync", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    mockServer();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads the stored profile and renders suggestions from it", async () => {
    render(
      <SettingsProvider>
        <ProfileSettingsForm />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Suggested for you")).toBeInTheDocument();
    });
    expect(screen.getByText("Asia AI Summit 2026")).toBeInTheDocument();
    expect(
      screen.getByText(/Matches Technology, AI & Consumer Electronics/i)
    ).toBeInTheDocument();
  });

  it("stays local-only when the server has no session", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    }) as any;

    render(
      <SettingsProvider>
        <ProfileSettingsForm />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Stored only in this browser/i)).toBeInTheDocument();
    });
    expect(screen.queryByText("Suggested for you")).toBeNull();
  });

  it("syncs interests to the server on save", async () => {
    render(
      <SettingsProvider>
        <ProfileSettingsForm />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Suggested for you")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Preferences/i }));

    await waitFor(() => {
      const calls = (global.fetch as any).mock.calls.filter(
        ([url, init]: any[]) => url === "/api/profile" && init?.method === "PATCH"
      );
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][1].body).toContain("TECH_DEV_SUMMIT");
    });
  });
});
