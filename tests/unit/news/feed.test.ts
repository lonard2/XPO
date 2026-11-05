import { describe, it, expect } from "vitest";
import { selectRailItems, selectTimelineItems } from "@/lib/news/feed";

const now = new Date("2026-11-10T00:00:00Z");

const slot = (overrides: Record<string, unknown> = {}) => ({
  updateId: "upd-1",
  position: 0,
  update: {
    id: "upd-1",
    title: "Doors open early",
    body: "Gates at 8.",
    status: "APPROVED",
    event: {
      slug: "expo-2026",
      title: "Expo 2026",
      endDate: new Date("2026-11-20T00:00:00Z"),
    },
    ...(overrides.update as Record<string, unknown> | undefined),
  },
  ...overrides,
});

describe("News feed predicates", () => {
  it("keeps approved updates on upcoming events", () => {
    const items = selectRailItems([slot()], now);
    expect(items).toHaveLength(1);
    expect(items[0].updateId).toBe("upd-1");
    expect(items[0].eventSlug).toBe("expo-2026");
  });

  it("drops drafts even when slotted", () => {
    const items = selectRailItems(
      [slot({ update: { id: "upd-1", title: "T", body: "B", status: "DRAFT", event: { slug: "s", title: "E", endDate: new Date("2026-11-20T00:00:00Z") } } })],
      now
    );
    expect(items).toEqual([]);
  });

  it("drops approved updates whose event has ended", () => {
    const items = selectRailItems(
      [slot({ update: { id: "upd-1", title: "T", body: "B", status: "APPROVED", event: { slug: "s", title: "E", endDate: new Date("2026-11-01T00:00:00Z") } } })],
      now
    );
    expect(items).toEqual([]);
  });

  it("preserves slot order", () => {
    const second = slot({
      updateId: "upd-2",
      position: 1,
      update: {
        id: "upd-2",
        title: "Second",
        body: "B",
        status: "APPROVED",
        event: { slug: "s2", title: "E2", endDate: new Date("2026-11-25T00:00:00Z") },
      },
    });
    const items = selectRailItems([slot(), second], now);
    expect(items.map((i) => i.updateId)).toEqual(["upd-1", "upd-2"]);
  });

  it("timeline keeps approved rows only", () => {
    const rows = [
      { id: "a", title: "A", body: "x", status: "APPROVED", approvedAt: new Date("2026-11-02T00:00:00Z") },
      { id: "b", title: "B", body: "y", status: "DRAFT", approvedAt: null },
    ];
    const items = selectTimelineItems(rows);
    expect(items.map((i) => i.id)).toEqual(["a"]);
  });
});
