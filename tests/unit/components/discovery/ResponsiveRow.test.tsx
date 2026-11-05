import { describe, it, expect, vi, beforeAll } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponsiveRow } from "@/components/discovery/ResponsiveRow";
import { rowGridClass } from "@/lib/discovery/grids";

beforeAll(() => {
  // jsdom does not implement scrollBy.
  Element.prototype.scrollBy = vi.fn() as never;
});

const items = ["a", "b", "c"].map((id) => <div key={id}>{id}</div>);

function stubMetrics(width: number, scrollWidth: number) {
  const region = screen.getByRole("region");
  Object.defineProperty(region, "clientWidth", { configurable: true, value: width });
  Object.defineProperty(region, "scrollWidth", { configurable: true, value: scrollWidth });
  fireEvent.scroll(region);
}

describe("rowGridClass", () => {
  it("centres a single item", () => {
    expect(rowGridClass(1)).toContain("max-w-3xl");
  });
});

describe("ResponsiveRow", () => {
  it("renders every child and labeled scroller controls", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);

    for (const id of ["a", "b", "c"]) {
      expect(screen.getByText(id)).toBeDefined();
    }
    expect(screen.getByRole("button", { name: /previous items/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next items/i })).toBeDefined();
  });

  it("keeps the mobile scroller a flex container, never a grid", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    const region = screen.getByRole("region");
    // twMerge previously collapsed flex into grid here, killing the scroll.
    expect(region.classList.contains("flex")).toBe(true);
    expect(region.classList.contains("grid")).toBe(false);
    expect(region.classList.contains("md:grid")).toBe(true);
  });

  it("disables both controls when the items fit", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    stubMetrics(300, 300);
    expect(screen.getByRole("button", { name: /previous items/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next items/i })).toBeDisabled();
  });

  it("advances on Next when there is overflow", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    stubMetrics(300, 1200);

    const prev = screen.getByRole("button", { name: /previous items/i });
    const next = screen.getByRole("button", { name: /next items/i });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();

    fireEvent.click(next);
    expect(Element.prototype.scrollBy).toHaveBeenCalled();
  });

  it("honours a column cap for dense rows", () => {
    render(<ResponsiveRow maxColumns={3}>{items}</ResponsiveRow>);
    const region = screen.getByRole("region");
    expect(region.classList.contains("lg:grid-cols-3")).toBe(true);
    expect(region.classList.contains("xl:grid-cols-4")).toBe(false);
  });

  it("stretches every item so CTA rows align", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    const region = screen.getByRole("region");
    for (const wrapper of Array.from(region.children)) {
      expect(wrapper.className).toContain("h-full");
    }
  });

  it("centres an odd final item at tablet widths", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    const last = screen.getByRole("region").lastElementChild;
    expect(last?.className).toContain("md:col-span-2");
    expect(last?.className).toContain("md:mx-auto");
    expect(last?.className).toContain("md:w-1/2");
    expect(last?.className).toContain("lg:col-span-1");
    expect(last?.className).toContain("lg:mx-0");
  });

  it("does not centre an even final item", () => {
    render(<ResponsiveRow>{items.slice(0, 2)}</ResponsiveRow>);
    const last = screen.getByRole("region").lastElementChild;
    expect(last?.className).not.toContain("md:col-span-2");
  });

  it("keeps the controls mobile-only", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    const controls = screen
      .getByRole("button", { name: /next items/i })
      .closest("div");
    expect(controls?.className).toContain("md:hidden");
  });
});
