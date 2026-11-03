import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemonstrationBadge } from "@/components/themed/DemonstrationBadge";

describe("DemonstrationBadge", () => {
  it("labels unbacked showcase content", () => {
    render(<DemonstrationBadge />);
    expect(screen.getByText("Demonstration")).toBeInTheDocument();
  });
});
