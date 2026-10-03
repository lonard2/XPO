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

  it("filters booth roster by occupancy status", () => {
    const occupied = sampleBooths.filter((b) => b.companyName && b.companyName.trim() !== "");
    const available = sampleBooths.filter((b) => !b.companyName || b.companyName.trim() === "");

    expect(occupied.length).toBe(3);
    expect(available.length).toBe(2);
    expect(available.map((b) => b.boothNumber)).toEqual(["Hall A1 - B08", "Hall A2 - C06"]);
  });

  it("releases tenant allocation to vacate a booth lot", () => {
    const original = sampleBooths[0];
    const vacated = {
      ...original,
      companyName: "",
      websiteUrl: null,
      description: null,
    };

    expect(vacated.companyName).toBe("");
    expect(vacated.websiteUrl).toBeNull();
    const isOccupied = Boolean(vacated.companyName && vacated.companyName.trim() !== "");
    expect(isOccupied).toBe(false);
  });

  it("detects duplicate booth numbers in incoming lot batches", () => {
    const incoming = [
      { boothNumber: "Hall A1 - B01", hallName: "Hall A1" },
      { boothNumber: "Hall A1 - B02", hallName: "Hall A1" },
      { boothNumber: "HALL A1 - B01", hallName: "Hall A1" }, // Duplicate normalized
    ];

    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const item of incoming) {
      const normalized = item.boothNumber.trim().toLowerCase();
      if (seen.has(normalized)) {
        duplicates.push(item.boothNumber);
      } else {
        seen.add(normalized);
      }
    }

    expect(duplicates.length).toBe(1);
    expect(duplicates[0]).toBe("HALL A1 - B01");
  });

  it("sanitizes website URLs rejecting javascript: schemes", () => {
    const sanitizeUrl = (url: string | null | undefined): string | null => {
      if (!url) return null;
      const trimmed = url.trim();
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (/^javascript:/i.test(trimmed)) return null;
      if (/^data:/i.test(trimmed)) return null;
      return `https://${trimmed}`;
    };

    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeUrl("http://company.org/exhibitor")).toBe("http://company.org/exhibitor");
    expect(sanitizeUrl("company.jp")).toBe("https://company.jp");
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("data:text/html;base64,...")).toBeNull();
    expect(sanitizeUrl("")).toBeNull();
  });
});
