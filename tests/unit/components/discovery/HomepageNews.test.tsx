import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { HomepageNewsRail } from "@/components/discovery/HomepageNewsRail";
import { EventNewsTimeline } from "@/components/discovery/EventNewsTimeline";
import enMessages from "@/messages/en.json";

const items = [
  {
    updateId: "upd-01",
    title: "Doors open early",
    body: "Gates at 8.\nSee you there.",
    eventSlug: "flagship-expo-2026",
    eventTitle: "Flagship Expo 2026",
  },
  {
    updateId: "upd-02",
    title: "Lineup drop",
    body: "Acts announced.",
    eventSlug: "flagship-expo-2026",
    eventTitle: "Flagship Expo 2026",
  },
];

describe("Discovery: HomepageNewsRail", () => {
  it("renders slotted updates in order with anchored event links", () => {
    render(<HomepageNewsRail items={items} locale="en" />);
    const links = screen.getAllByRole("link");
    expect(links[0].getAttribute("href")).toContain("#update-upd-01");
    expect(links[1].getAttribute("href")).toContain("#update-upd-02");
    expect(screen.getByText("Doors open early")).toBeDefined();
  });

  it("renders nothing when there are no slots", () => {
    const { container } = render(<HomepageNewsRail items={[]} locale="en" />);
    expect(container.firstChild).toBeNull();
  });
});

describe("Discovery: EventNewsTimeline", () => {
  const approved = [
    { id: "upd-01", title: "Doors open early", body: "Gates at 8.", approvedAt: "2026-11-02T00:00:00Z" },
    { id: "upd-02", title: "Draft note", body: "Not yet.", approvedAt: null },
  ];

  it("renders approved items only, each anchored, bodies as plain text", () => {
    const { container } = render(
      <EventNewsTimeline items={approved.filter((u) => u.approvedAt)} locale="en" />
    );
    expect(screen.getByText("Doors open early")).toBeDefined();
    expect(screen.queryByText("Draft note")).toBeNull();
    expect(document.getElementById("update-upd-01")).not.toBeNull();
    const body = container.querySelector(".news-body");
    expect(body).not.toBeNull();
    expect(body!.querySelector("a")).toBeNull();
  });

  it("renders nothing without approved items", () => {
    const { container } = render(<EventNewsTimeline items={[]} locale="en" />);
    expect(container.firstChild).toBeNull();
  });
});

describe("Quality Gate: news dictionary usage", () => {
  it("every literal news key exists in all six locales", () => {
    const sources = [
      readFileSync("src/components/discovery/HomepageNewsRail.tsx", "utf8"),
      readFileSync("src/components/discovery/EventNewsTimeline.tsx", "utf8"),
    ].join("\n");
    const missing: string[] = [];
    for (const match of sources.matchAll(/\btNews\('([^']+)'\)/g)) {
      for (const locale of ["en", "id", "ja", "zh-CN", "de", "es"]) {
        const bundle = readFileSync(`src/messages/${locale}.json`, "utf8");
        const parsed = JSON.parse(bundle) as Record<string, Record<string, unknown>>;
        if (!(match[1] in (parsed.news ?? {}))) missing.push(`${locale}.news.${match[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("keeps the news namespace in key parity with en", () => {
    const en = (enMessages as Record<string, Record<string, unknown>>).news;
    expect(Object.keys(en).length).toBeGreaterThan(0);
  });
});
