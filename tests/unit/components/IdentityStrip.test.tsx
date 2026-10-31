import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { IdentityStrip } from "@/components/discovery/IdentityStrip";

const props = {
  badge: "MICE event directory",
  title: "Expos and conferences,",
  highlight: "down to the hall.",
  subtitle:
    "Find them in Indonesia, Japan, and other trade hubs. See the venue, the hall, and how to get there, then carry your pass on your phone.",
  proofs: ["22 event categories", "Hall and transit data", "Passes work offline"],
  regionName: "Indonesia",
};

describe("IdentityStrip", () => {
  it("renders a single visible h1 that joins title and highlight", () => {
    render(<IdentityStrip {...props} />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Expos and conferences, down to the hall."
    );
    expect(headings[0].className).not.toContain("sr-only");
  });

  it("shows the platform label, subtitle, edition and proof facts", () => {
    render(<IdentityStrip {...props} />);
    expect(screen.getByText("MICE event directory")).toBeDefined();
    expect(screen.getByText(props.subtitle)).toBeDefined();
    expect(screen.getByText("Indonesia")).toBeDefined();
    for (const proof of props.proofs) {
      expect(screen.getByText(proof)).toBeDefined();
    }
  });

  it("keeps the proof row as a list so the facts are announced together", () => {
    const { container } = render(<IdentityStrip {...props} />);
    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    expect(list!.querySelectorAll("li")).toHaveLength(props.proofs.length);
  });
});
