import { describe, it, expect } from "vitest";
import {
  UPDATE_TITLE_MAX,
  UPDATE_BODY_MAX,
  NEWS_SLOTS_MAX,
  EventUpdateInput,
  NewsSlotInput,
  updateAnchor,
} from "@/lib/news/validation";

describe("Event news validation", () => {
  it("pins the editorial caps", () => {
    expect(UPDATE_TITLE_MAX).toBe(120);
    expect(UPDATE_BODY_MAX).toBe(500);
    expect(NEWS_SLOTS_MAX).toBe(6);
  });

  it("rejects titles over 120 characters", () => {
    const result = EventUpdateInput.safeParse({
      title: "x".repeat(121),
      body: "Doors open an hour early.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bodies over 500 characters", () => {
    const result = EventUpdateInput.safeParse({
      title: "Doors open early",
      body: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty titles and bodies", () => {
    expect(
      EventUpdateInput.safeParse({ title: "   ", body: "Something." }).success
    ).toBe(false);
    expect(
      EventUpdateInput.safeParse({ title: "Something", body: "" }).success
    ).toBe(false);
  });

  it("rejects negative slot positions", () => {
    const result = NewsSlotInput.safeParse({
      updateId: "abc123",
      regionId: "id",
      position: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects regions outside id, jp, and global", () => {
    const result = NewsSlotInput.safeParse({
      updateId: "abc123",
      regionId: "eu",
      position: 0,
    });
    expect(result.success).toBe(false);
  });

  it("builds stable update anchors", () => {
    expect(updateAnchor("abc123")).toBe("#update-abc123");
  });
});
