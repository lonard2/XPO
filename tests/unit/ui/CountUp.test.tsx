import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { CountUp, easeOutCubic } from "@/components/ui/CountUp";

describe("CountUp", () => {
  it("eases out cubic from 0 to 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 3);
    expect(easeOutCubic(-2)).toBe(0);
    expect(easeOutCubic(9)).toBe(1);
  });

  it("renders the final value instantly under reduced motion", () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = (() => ({ matches: true })) as any;
    try {
      render(<CountUp value={123456} />);
      expect(screen.getByText("123,456")).toBeInTheDocument();
    } finally {
      window.matchMedia = matchMedia;
    }
  });

  it("renders from zero with the final value exposed to assistive tech", () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = (() => ({ matches: false })) as any;
    try {
      const { container } = render(<CountUp value={42} />);
      const el = container.firstChild as HTMLElement;
      expect(el.getAttribute("aria-label")).toBe("42");
    } finally {
      window.matchMedia = matchMedia;
    }
  });
});
