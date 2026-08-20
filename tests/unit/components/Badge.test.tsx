import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("UI Primitive: Badge", () => {
  it("renders text content properly", () => {
    render(<Badge>Featured Event</Badge>);
    expect(screen.getByText("Featured Event")).toBeInTheDocument();
  });

  it("applies success and warning variant styles", () => {
    const { rerender } = render(<Badge variant="success">Confirmed</Badge>);
    expect(screen.getByText("Confirmed")).toHaveClass("text-emerald-700");

    rerender(<Badge variant="warning">Few Tickets Left</Badge>);
    expect(screen.getByText("Few Tickets Left")).toHaveClass("text-amber-700");
  });
});
