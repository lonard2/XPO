import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Breadcrumbs, BreadcrumbJsonLd } from "@/components/layout/Breadcrumbs";

const items = [
  { label: "Home", href: "/en" },
  { label: "Venues", href: "/en/venues" },
  { label: "JIExpo Kemayoran", href: "/en/venues/jiexpo-kemayoran" },
];

describe("Breadcrumbs", () => {
  it("is a labelled navigation landmark containing an ordered list", () => {
    const { container } = render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.tagName).toBe("NAV");
    const list = nav.querySelector("ol");
    expect(list).not.toBeNull();
    expect(list!.querySelectorAll("li")).toHaveLength(items.length);
    expect(container.querySelector("ul")).toBeNull();
  });

  it("links every crumb except the current page", () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/en");
    expect(screen.getByRole("link", { name: "Venues" })).toHaveAttribute("href", "/en/venues");
    expect(screen.queryByRole("link", { name: "JIExpo Kemayoran" })).toBeNull();
    expect(screen.getByText("JIExpo Kemayoran")).toHaveAttribute("aria-current", "page");
  });

  it("hides the separator from assistive technology", () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll("svg[aria-hidden='true']");
    expect(separators.length).toBe(items.length - 1);
  });

  it("carries no current-page marker when only one crumb exists", () => {
    render(<Breadcrumbs items={[{ label: "Home", href: "/en" }]} />);
    expect(screen.getByText("Home")).toHaveAttribute("aria-current", "page");
  });
});

describe("BreadcrumbJsonLd", () => {
  it("emits a BreadcrumbList that matches the visible trail", () => {
    const { container } = render(<BreadcrumbJsonLd items={items} />);

    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.innerHTML);

    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement.map((entry: any) => entry.position)).toEqual([1, 2, 3]);
    expect(json.itemListElement.map((entry: any) => entry.name)).toEqual(
      items.map((item) => item.label)
    );
    expect(json.itemListElement[0].item).toMatch(/\/en$/);
  });
});
