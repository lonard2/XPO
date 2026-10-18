import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

function Harness() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three">Three</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Panel one</TabsContent>
      <TabsContent value="two">Panel two</TabsContent>
      <TabsContent value="three">Panel three</TabsContent>
    </Tabs>
  );
}

describe("Tabs primitive keyboard and ARIA pattern", () => {
  it("links tabs to panels and roves tabindex to the selected tab", () => {
    render(<Harness />);

    const tabOne = screen.getByRole("tab", { name: "One" });
    const tabTwo = screen.getByRole("tab", { name: "Two" });

    expect(tabOne).toHaveAttribute("aria-controls", "panel-one");
    expect(tabOne).toHaveAttribute("tabindex", "0");
    expect(tabTwo).toHaveAttribute("tabindex", "-1");
    expect(tabOne.className).toContain("min-h-[44px]");

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("id", "panel-one");
    expect(panel).toHaveAttribute("aria-labelledby", "tab-one");
  });

  it("moves selection with arrow keys", () => {
    render(<Harness />);

    const tabOne = screen.getByRole("tab", { name: "One" });
    tabOne.focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Panel two")).toBeInTheDocument();
  });
});
