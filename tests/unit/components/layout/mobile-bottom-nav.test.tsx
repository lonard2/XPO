import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
}));

describe("Component: MobileBottomNav", () => {
  it("marks the current destination for assistive tech", () => {
    render(<MobileBottomNav locale="en" />);

    const home = screen.getByRole("link", { name: /Explore/i });
    expect(home).toHaveAttribute("aria-current", "page");
  });
});
