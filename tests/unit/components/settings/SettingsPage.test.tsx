import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import SettingsPage from "@/app/[locale]/settings/page";

// React.use() promise unwrapping never settles in this harness; resolve synchronously.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof React>();
  return { ...actual, use: () => ({ locale: "en" }) };
});

describe("SettingsPage appearance disclosure and deep links", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "";
  });

  afterEach(() => {
    localStorage.clear();
    window.location.hash = "";
  });

  it("opens Theme and Font Scale by default and discloses the rest with active values", () => {
    render(
      <SettingsProvider>
        <SettingsPage params={Promise.resolve({ locale: "en" })} />
      </SettingsProvider>
    );

    // Open by default: theme options visible.
    expect(screen.getAllByText(/High Contrast/i).length).toBeGreaterThan(0);
    // Collapsed: typography options hidden until disclosed.
    expect(screen.queryByText(/Atkinson Hyperlegible/i)).toBeNull();

    const typoToggle = screen.getByRole("button", { name: /Typography Engine/i });
    expect(typoToggle).toHaveAttribute("aria-expanded", "false");
    act(() => {
      fireEvent.click(typoToggle);
    });
    expect(typoToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Atkinson Hyperlegible/i)).toBeInTheDocument();
  });

  it("honors the location hash for deep-linkable tabs", () => {
    window.location.hash = "#profile";
    render(
      <SettingsProvider>
        <SettingsPage params={Promise.resolve({ locale: "en" })} />
      </SettingsProvider>
    );

    expect(screen.getByRole("tab", { name: /Profile/i })).toHaveAttribute("aria-selected", "true");
  });
});
