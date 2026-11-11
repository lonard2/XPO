import { describe, it, expect } from "vitest";
import { countHalls, countSpaces } from "@/lib/discovery/venueSpaces";

const space = (kind: string) => ({ id: kind, name: kind, kind });

describe("countSpaces", () => {
  it("counts only halls for a convention center, not ballrooms or meeting rooms", () => {
    const halls = [
      space("HALL"),
      space("HALL"),
      space("BALLROOM"),
      space("MEETING_ROOM"),
    ];
    expect(countSpaces(halls, "CONVENTION_CENTER")).toBe(2);
    expect(countHalls(halls)).toBe(3);
  });

  it("counts every non-meeting-room space for a mall", () => {
    expect(countSpaces([space("ATRIUM")], "MALL")).toBe(1);
    expect(countSpaces([space("ATRIUM"), space("MEETING_ROOM")], "MALL")).toBe(1);
  });

  it("counts fields, arenas, and courts for a stadium", () => {
    expect(
      countSpaces([space("FIELD"), space("ARENA"), space("COURT"), space("MEETING_ROOM")], "STADIUM")
    ).toBe(3);
  });

  it("counts an outdoor ground as one space", () => {
    expect(countSpaces([space("FIELD")], "OUTDOOR")).toBe(1);
    expect(countSpaces([space("OUTDOOR")], "OUTDOOR")).toBe(1);
  });

  it("falls back to the convention-center rule for an unknown type", () => {
    expect(countSpaces([space("HALL"), space("ATRIUM")], "not-a-type")).toBe(1);
  });
});
