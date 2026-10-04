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

  it("formats booth records into RFC 4180 compliant CSV export", () => {
    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      "BoothNumber",
      "HallName",
      "CompanyName",
      "Status",
      "Industry",
      "Dimensions",
      "AreaSqm",
      "BoothType",
      "WebsiteUrl",
      "Description",
    ];

    const rows = sampleBooths.map((b) => {
      const isOccupied = b.companyName && b.companyName.trim() !== "";
      return [
        escapeCsv(b.boothNumber),
        escapeCsv(b.hallName),
        escapeCsv(b.companyName || "Unassigned"),
        escapeCsv(isOccupied ? "OCCUPIED" : "AVAILABLE"),
        escapeCsv(b.industry || ""),
        escapeCsv("3m x 3m"),
        escapeCsv(9),
        escapeCsv("SHELL_SCHEME"),
        escapeCsv(""),
        escapeCsv(""),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    expect(csvContent).toContain("BoothNumber,HallName,CompanyName");
    expect(csvContent).toContain('"Hall A1 - B01","Hall A1","PT Automation Robotics","OCCUPIED"');
    expect(csvContent).toContain('"Hall A1 - B08","Hall A1","Unassigned","AVAILABLE"');
    const lineCount = csvContent.split("\r\n").length;
    expect(lineCount).toBe(6); // 1 header + 5 rows
  });

  it("parses and validates MICE physical space dimensions and structure types", () => {
    const boothSpecs = {
      dimensions: "6m x 3m",
      areaSqm: 18,
      boothType: "RAW_SPACE",
    };

    expect(boothSpecs.dimensions).toMatch(/^\d+m\s*x\s*\d+m$/i);
    expect(boothSpecs.areaSqm).toBe(18);
    expect(["SHELL_SCHEME", "RAW_SPACE", "ISLAND", "CORNER"]).toContain(boothSpecs.boothType);
  });

  it("calculates accurate per-hall saturation telemetry metrics", () => {
    const hallsList = ["Hall A1", "Hall A2"];
    const hallStats = hallsList.map((hall) => {
      const hallBooths = sampleBooths.filter((b) => b.hallName === hall);
      const total = hallBooths.length;
      const occupied = hallBooths.filter((b) => b.companyName && b.companyName.trim() !== "").length;
      const available = total - occupied;
      const saturation = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return { hall, total, occupied, available, saturation };
    });

    expect(hallStats).toHaveLength(2);
    // Hall A1: 3 total, 2 occupied (b1, b2), 1 available (b3) => 67%
    expect(hallStats[0]).toEqual({
      hall: "Hall A1",
      total: 3,
      occupied: 2,
      available: 1,
      saturation: 67,
    });
    // Hall A2: 2 total, 1 occupied (b4), 1 available (b5) => 50%
    expect(hallStats[1]).toEqual({
      hall: "Hall A2",
      total: 2,
      occupied: 1,
      available: 1,
      saturation: 50,
    });
  });

  it("handles multi-lot batch selection toggles and bulk operations", () => {
    let selectedIds = new Set<string>();

    // Toggle individual selections
    const toggleSelect = (id: string) => {
      if (selectedIds.has(id)) {
        selectedIds.delete(id);
      } else {
        selectedIds.add(id);
      }
    };

    toggleSelect("b1");
    toggleSelect("b2");
    expect(selectedIds.size).toBe(2);
    expect(selectedIds.has("b1")).toBe(true);
    expect(selectedIds.has("b2")).toBe(true);

    toggleSelect("b1");
    expect(selectedIds.size).toBe(1);
    expect(selectedIds.has("b1")).toBe(false);

    // Select all displayed
    sampleBooths.forEach((b) => selectedIds.add(b.id));
    expect(selectedIds.size).toBe(sampleBooths.length);

    // Batch vacate operation on selected IDs
    const batchVacated = sampleBooths.map((b) =>
      selectedIds.has(b.id)
        ? { ...b, companyName: "", industry: null }
        : b
    );
    expect(batchVacated.every((b) => b.companyName === "")).toBe(true);

    // Batch decommission operation on selected IDs
    const toDeleteIds = new Set(["b1", "b2"]);
    const remaining = sampleBooths.filter((b) => !toDeleteIds.has(b.id));
    expect(remaining).toHaveLength(3);
    expect(remaining.map((b) => b.id)).toEqual(["b3", "b4", "b5"]);
  });
});

