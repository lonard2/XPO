import { describe, it, expect, vi, beforeAll } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponsiveRow } from "@/components/discovery/ResponsiveRow";
import { rowGridClass } from "@/lib/discovery/grids";

beforeAll(() => {
  // jsdom does not implement scrollBy.
  Element.prototype.scrollBy = vi.fn() as never;
});

describe("rowGridClass", () => {
  it("centres a single item", () => {
    expect(rowGridClass(1)).toContain("max-w-3xl");
  });

  it("adds columns as inventory grows", () => {
    expect(rowGridClass(2)).toContain("md:grid-cols-2");
    expect(rowGridClass(3)).toContain("lg:grid-cols-3");
    expect(rowGridClass(4)).toContain("xl:grid-cols-4");
    expect(rowGridClass(4)).not.toContain("1800px");
  });

  it("goes to five columns only on very wide screens", () => {
    expect(rowGridClass(5)).toContain("min-[1800px]:grid-cols-5");
  });
});

describe("ResponsiveRow", () => {
  const items = ["a", "b", "c"].map((id) => <div key={id}>{id}</div>);

  it("renders every child and labeled scroller controls", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);

    for (const id of ["a", "b", "c"]) {
      expect(screen.getByText(id)).toBeDefined();
    }
    expect(screen.getByRole("button", { name: /previous items/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next items/i })).toBeDefined();
  });

  it("starts with Previous disabled and advances on Next", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);

    const prev = screen.getByRole("button", { name: /previous items/i });
    const next = screen.getByRole("button", { name: /next items/i });
    expect(prev).toBeDisabled();

    fireEvent.click(next);
    expect(Element.prototype.scrollBy).toHaveBeenCalled();
  });

  it("keeps the controls mobile-only", () => {
    render(<ResponsiveRow>{items}</ResponsiveRow>);
    const controls = screen
      .getByRole("button", { name: /next items/i })
      .closest("div");
    expect(controls?.className).toContain("md:hidden");
  });
});
