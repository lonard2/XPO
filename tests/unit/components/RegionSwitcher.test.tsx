import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { RegionSwitcher } from "@/components/layout/RegionSwitcher";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => "/en",
}));

describe("Component: RegionSwitcher", () => {
  it("renders the active region name and opens dropdown listbox", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" />);

    const button = screen.getByRole("button", { name: /Select Country/i });
    expect(button).toBeDefined();
    expect(screen.getByText("Indonesia")).toBeDefined();

    fireEvent.click(button);

    expect(screen.getByText("Japan")).toBeDefined();
    expect(screen.getByText("Global Gateways")).toBeDefined();
  });

  it("navigates to the selected country edition route", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" />);

    const button = screen.getByRole("button", { name: /Select Country/i });
    fireEvent.click(button);

    const jpOption = screen.getByText("Japan");
    fireEvent.click(jpOption);

    expect(mockPush).toHaveBeenCalledWith("/en?region=jp");
  });

  it("resolves the edition from ?region= after mount", async () => {
    document.cookie = "xpo_region=; path=/; max-age=0";
    window.history.replaceState({}, "", "/en?region=jp");
    render(<RegionSwitcher currentLocale="en" compact />);

    // The first render is server-safe; the URL lands one paint later.
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /JP \(JPY\)/ })
      ).toBeDefined();
    });
    window.history.replaceState({}, "", "/en");
  });

  it("renders a compact edition trigger with the currency code", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" compact />);

    const button = screen.getByRole("button", { name: /Select Country/i });
    expect(button.textContent).toMatch(/ID\s*\(IDR\)/);
    expect(button).not.toHaveTextContent("Indonesia");
  });

  it("keeps the compact menu inside the phone viewport", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" compact />);

    fireEvent.click(screen.getByRole("button", { name: /Select Country/i }));

    const listbox = screen.getByRole("listbox");
    // A 256px box anchored right-0 to a narrow trigger runs off the left
    // edge at 390. The compact menu is a fixed, inset sheet instead.
    expect(listbox.className).toContain("fixed");
    expect(listbox.className).toContain("left-4");
    expect(listbox.className).toContain("right-4");
  });

  it("names the compact trigger by the label it shows", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" compact />);

    // WCAG 2.5.3: the visible "ID (IDR)" must be part of the accessible name.
    expect(
      screen.getByRole("button", { name: /ID \(IDR\)/ })
    ).toBeDefined();
  });

  it("renders cards variant with venue highlights and currencies", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" variant="cards" />);

    expect(screen.getByText("JIExpo Kemayoran, ICE BSD City, JICC Senayan, NICE PIK 2, GBK Complex, JIS")).toBeDefined();
    expect(screen.getByText("Currency: IDR")).toBeDefined();
    expect(screen.getByText("Currency: JPY")).toBeDefined();
    expect(screen.getByText("Currency: USD")).toBeDefined();
  });

  it("renders pills variant with proper role attributes", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="jp" variant="pills" />);

    const radiogroup = screen.getByRole("radiogroup", { name: /Country selection/i });
    expect(radiogroup).toBeDefined();

    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(3);
  });
});
