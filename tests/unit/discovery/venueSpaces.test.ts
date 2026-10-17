import { describe, it, expect } from "vitest";
import { isMeetingRoom, hallsOnly, meetingRoomsOnly, countHalls } from "@/lib/discovery/venueSpaces";

const HALL_A = { kind: "HALL", name: "Hall A" };
const THEATRE = { kind: undefined, name: "JIExpo Theatre" };
const ROOM = { kind: "MEETING_ROOM", name: "Garuda 1" };
const ROOM_LOWER = { kind: "meeting_room", name: "Nuri Room 1" };

describe("venueSpaces", () => {
  it("treats HALL and missing kind as halls, never as meeting rooms", () => {
    expect(isMeetingRoom(HALL_A)).toBe(false);
    expect(isMeetingRoom(THEATRE)).toBe(false);
    expect(isMeetingRoom(ROOM)).toBe(true);
  });

  it("matches the kind case-insensitively", () => {
    expect(isMeetingRoom(ROOM_LOWER)).toBe(true);
  });

  it("splits halls from meeting rooms", () => {
    const all = [HALL_A, ROOM, THEATRE, ROOM_LOWER];

    expect(hallsOnly(all).map((h) => h.name)).toEqual(["Hall A", "JIExpo Theatre"]);
    expect(meetingRoomsOnly(all).map((h) => h.name)).toEqual(["Garuda 1", "Nuri Room 1"]);
  });

  it("counts halls without the meeting rooms", () => {
    expect(countHalls([HALL_A, ROOM, THEATRE, ROOM_LOWER])).toBe(2);
  });

  it("counts an empty or missing list as zero", () => {
    expect(countHalls([])).toBe(0);
    expect(countHalls(undefined)).toBe(0);
    expect(countHalls(null)).toBe(0);
  });
});
