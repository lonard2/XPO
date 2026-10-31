import { describe, it, expect } from "vitest";
import { splitVenueName } from "@/components/discovery/MajorVenuesUpcomingSection";

describe("splitVenueName", () => {
  it("keeps the campus name and demotes the legal name", () => {
    expect(splitVenueName("JIExpo Kemayoran (Jakarta International Expo)")).toEqual({
      primary: "JIExpo Kemayoran",
      secondary: "Jakarta International Expo",
    });
  });

  it("keeps a slash-separated legal name intact", () => {
    expect(
      splitVenueName("JICC (Jakarta International Convention Center / Balai Sidang)")
    ).toEqual({
      primary: "JICC",
      secondary: "Jakarta International Convention Center / Balai Sidang",
    });
  });

  it("leaves a name without brackets alone", () => {
    expect(splitVenueName("Marina Bay Sands Expo")).toEqual({
      primary: "Marina Bay Sands Expo",
      secondary: null,
    });
  });

  it("handles brackets that are not at the end", () => {
    expect(splitVenueName("Tokyo Big Sight (West Hall) Annex")).toEqual({
      primary: "Tokyo Big Sight (West Hall) Annex",
      secondary: null,
    });
  });
});
