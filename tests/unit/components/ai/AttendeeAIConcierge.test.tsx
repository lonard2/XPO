import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { AttendeeAIConcierge } from "@/components/ai/AttendeeAIConcierge";

describe("AttendeeAIConcierge Component", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    // Mock fetch for concierge API
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        body: {
          getReader() {
            const encoder = new TextEncoder();
            let sent = false;
            return {
              read() {
                if (!sent) {
                  sent = true;
                  return Promise.resolve({
                    done: false,
                    value: encoder.encode("Hall A1 is located adjacent to the Main Registration Foyer on Level 1."),
                  });
                }
                return Promise.resolve({ done: true, value: undefined });
              },
            };
          },
        },
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders floating action button trigger when AI is enabled", async () => {
    render(
      <SettingsProvider>
        <AttendeeAIConcierge />
      </SettingsProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Attendee AI Concierge/i });
    expect(launcher).toBeInTheDocument();
  });

  it("opens expandable chat modal dialog when FAB is clicked", async () => {
    render(
      <SettingsProvider>
        <AttendeeAIConcierge />
      </SettingsProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Attendee AI Concierge/i });
    act(() => {
      fireEvent.click(launcher);
    });

    expect(screen.getByRole("dialog", { name: /Attendee AI Concierge Chat Dialog/i })).toBeInTheDocument();
    expect(screen.getByText("Gemini 3.5 Flash Lite")).toBeInTheDocument();
  });

  it("renders suggested question chips and triggers immediate query", async () => {
    render(
      <SettingsProvider>
        <AttendeeAIConcierge />
      </SettingsProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Attendee AI Concierge/i });
    act(() => {
      fireEvent.click(launcher);
    });

    const chip = screen.getByRole("button", { name: /Where is Hall A1\?/i });
    expect(chip).toBeInTheDocument();

    act(() => {
      fireEvent.click(chip);
    });

    await waitFor(() => {
      expect(screen.getByText(/Where is Hall A1 and how do I navigate there\?/i)).toBeInTheDocument();
    });
  });

  it("submits typed questions and renders streaming response", async () => {
    render(
      <SettingsProvider>
        <AttendeeAIConcierge />
      </SettingsProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Attendee AI Concierge/i });
    act(() => {
      fireEvent.click(launcher);
    });

    const input = screen.getByPlaceholderText(/Ask about schedule, transit, halls/i);
    act(() => {
      fireEvent.change(input, { target: { value: "Where is the keynote plenary?" } });
    });

    const sendBtn = screen.getByRole("button", { name: /Send/i });
    act(() => {
      fireEvent.click(sendBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("Where is the keynote plenary?")).toBeInTheDocument();
      expect(screen.getByText(/Hall A1 is located adjacent/i)).toBeInTheDocument();
    });
  });

  it("clears chat history on clear button click", async () => {
    render(
      <SettingsProvider>
        <AttendeeAIConcierge />
      </SettingsProvider>
    );

    const launcher = screen.getByRole("button", { name: /Open Attendee AI Concierge/i });
    act(() => {
      fireEvent.click(launcher);
    });

    const clearBtn = screen.getByTitle("Clear chat history");
    act(() => {
      fireEvent.click(clearBtn);
    });

    expect(screen.getByText(/Chat history cleared/i)).toBeInTheDocument();
  });
});
