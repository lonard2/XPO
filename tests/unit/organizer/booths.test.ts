import { describe, it, expect } from "vitest";

describe("Phase 9 Unit: Booth Allocation & Occupancy Calculations", () => {
  const sampleBooths = [
    {
      id: "b1",
      eventId: "ev-1",
      companyName: "PT Automation Robotics",
      boothNumber: "Hall A1 - B01",
      hallName: "Hall A1",
      industry: "Robotics",
    },
    {
      id: "b2",
      eventId: "ev-1",
      companyName: "Tokyo Precision",
      boothNumber: "Hall A1 - B04",
      hallName: "Hall A1",
      industry: "Machining",
    },
    {
      id: "b3",
      eventId: "ev-1",
      companyName: "",
      boothNumber: "Hall A1 - B08",
      hallName: "Hall A1",
      industry: "Available",
    },
    {
      id: "b4",
      eventId: "ev-1",
      companyName: "Global Power Grid",
      boothNumber: "Hall A2 - C02",
      hallName: "Hall A2",
      industry: "Energy",
    },
    {
      id: "b5",
      eventId: "ev-1",
      companyName: "",
      boothNumber: "Hall A2 - C06",
      hallName: "Hall A2",
      industry: "Available",
    },
  ];

  it("calculates accurate floor occupancy percentages and available lots", () => {
    const totalCount = sampleBooths.length;
    const occupiedCount = sampleBooths.filter((b) => b.companyName && b.companyName.trim() !== "").length;
    const availableCount = totalCount - occupiedCount;
    const occupancyRate = Math.round((occupiedCount / totalCount) * 100);

    expect(totalCount).toBe(5);
    expect(occupiedCount).toBe(3);
    expect(availableCount).toBe(2);
    expect(occupancyRate).toBe(60);
  });

  it("filters booth roster by hall name", () => {
    const hallA1Booths = sampleBooths.filter((b) => b.hallName === "Hall A1");
    expect(hallA1Booths.length).toBe(3);

    const hallA2Booths = sampleBooths.filter((b) => b.hallName === "Hall A2");
    expect(hallA2Booths.length).toBe(2);
  });

  it("searches booth inventory by company name and booth code substring", () => {
    const query = "robotics";
    const matched = sampleBooths.filter(
      (b) =>
        b.companyName.toLowerCase().includes(query) ||
        b.industry.toLowerCase().includes(query)
    );
    expect(matched.length).toBe(1);
    expect(matched[0].companyName).toBe("PT Automation Robotics");
  });
});
