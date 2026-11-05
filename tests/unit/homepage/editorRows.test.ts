import { describe, it, expect } from "vitest";
import { resolveEditorRows } from "@/lib/homepage/editorRows";

const rows = [
  {
    id: "row-1",
    title: "Energy week",
    titleI18n: { id: "Pekan energi" },
    subtitle: "Grids",
    subtitleI18n: null,
    eventIdsJson: JSON.stringify(["evt-a", "evt-missing"]),
  },
  {
    id: "row-2",
    title: "All hidden",
    eventIdsJson: JSON.stringify(["evt-hidden"]),
  },
  {
    id: "row-3",
    title: "Broken json",
    eventIdsJson: "{not json",
  },
];

describe("resolveEditorRows", () => {
  const events = [
    { id: "evt-a", title: "Grid Expo" },
    { id: "evt-b", title: "Storage Summit" },
  ];

  it("skips ids that do not resolve to a renderable event", () => {
    const resolved = resolveEditorRows(rows, events, "en");
    expect(resolved.map((row) => row.id)).toEqual(["row-1"]);
    expect(resolved[0].items.map((item) => item.id)).toEqual(["evt-a"]);
  });

  it("drops rows with no surviving items, including broken JSON", () => {
    const resolved = resolveEditorRows(rows, events, "en");
    expect(resolved.some((row) => row.id === "row-2")).toBe(false);
    expect(resolved.some((row) => row.id === "row-3")).toBe(false);
  });

  it("resolves row copy per locale", () => {
    const resolved = resolveEditorRows(rows, events, "id");
    expect(resolved[0].title).toBe("Pekan energi");
    expect(resolved[0].subtitle).toBe("Grids");
  });
});
