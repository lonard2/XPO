import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    expect(screen.getByText("Global Hubs")).toBeDefined();
  });

  it("navigates to the selected country edition route", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" />);

    const button = screen.getByRole("button", { name: /Select Country/i });
    fireEvent.click(button);

    const jpOption = screen.getByText("Japan");
    fireEvent.click(jpOption);

    expect(mockPush).toHaveBeenCalledWith("/en?region=jp");
  });

  it("renders cards variant with venue highlights and currencies", () => {
    render(<RegionSwitcher currentLocale="en" activeRegionCode="id" variant="cards" />);

    expect(screen.getByText("JIExpo, ICE BSD, JICC, NICE PIK 2, GBK, JIS")).toBeDefined();
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
