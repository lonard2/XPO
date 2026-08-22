import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { AIReportsHub } from "@/components/ai/AIReportsHub";
import { EventMetricsContext, SavedAIReportItem } from "@/lib/ai/types";

describe("AIReportsHub Adversarial & Interactive Controls Suite", () => {
  const sampleEvent: EventMetricsContext = {
    id: "evt-adv-ui",
    title: "Asia AI & Robotics Expo 2026",
    slug: "asia-ai-robotics-expo-2026",
    description: "International AI exhibition.",
    archetype: "TECH_AI_SUMMIT",
    format: "IN_PERSON",
    scale: "LARGE",
    startDate: "2026-11-10T00:00:00.000Z",
    endDate: "2026-11-12T00:00:00.000Z",
    venue: {
      id: "v-ice",
      name: "ICE BSD City",
      city: "Tangerang",
      transitInfo: "Rawa Buntu KRL Station & Shuttle",
    },
    venueHall: { id: "hall-1", name: "Hall 1-3A", capacity: 10000 },
    totalBookings: 5000,
    totalCheckedIn: 4200,
    checkInRatePercent: 84,
    grossRevenue: 950000000,
    currency: "IDR",
    ticketTiers: [
      { id: "t1", name: "Standard Pass", price: 100000, currency: "IDR", capacity: 8000, soldCount: 4000 },
      { id: "t2", name: "VIP Pass", price: 500000, currency: "IDR", capacity: 1000, soldCount: 1000 },
    ],
    booths: [
      { id: "b1", companyName: "NVIDIA Enterprise", boothNumber: "Hall 1-01", hallName: "Hall 1" },
      { id: "b2", companyName: "Google Cloud AI", boothNumber: "Hall 1-02", hallName: "Hall 1" },
    ],
    agendaItems: [
      {
        id: "ag1",
        title: "Autonomous Logistics Keynote",
        speakerName: "Dr. Lina Zhang",
        location: "Grand Ballroom",
        startTime: "09:00",
        endTime: "10:00",
      },
    ],
  };

  const sampleReports: SavedAIReportItem[] = [
    {
      id: "rep-digest-1",
      eventId: "evt-adv-ui",
      modelUsed: "deepseek/deepseek-v4-pro-0813",
      reportType: "DAILY_DIGEST",
      contentJson: JSON.stringify({
        markdownContent: "# Daily Executive Intelligence Digest\n\nDeepSeek reasoning content.",
        structuredData: {
          summary: "DeepSeek audit analysis summary.",
          sentimentScore: 0.94,
          footTrafficIndex: 5200,
          registrationVelocity: {
            totalRegistrations: 5000,
            totalCheckedIn: 4200,
            checkInRatePercent: 84,
            projectedFinalAttendance: 5500,
          },
          revenueMetrics: {
            grossRevenue: 950000000,
            currency: "IDR",
            averageTicketValue: 190000,
            topTierByRevenue: "VIP Pass",
          },
          topSessions: [{ title: "Autonomous Logistics Keynote", attendance: 2200 }],
          keyHighlights: ["Zero gate pass discrepancies."],
          recommendedActions: ["Add 3 more express turnstiles", "Increase parking shuttle frequency"],
          modelUsed: "deepseek/deepseek-v4-pro-0813",
          generatedAt: new Date().toISOString(),
        },
      }),
      createdAt: new Date().toISOString(),
    },
    {
      id: "rep-malformed",
      eventId: "evt-adv-ui",
      modelUsed: "google/gemini-3.5-flash-lite",
      reportType: "SENTIMENT",
      contentJson: "INVALID_JSON_RAW_STRING_CONTENT",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    // Mock URL object methods for download tests
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/test-blob");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects every one of the 6 foundation models and updates UI state correctly", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const modelsToTest = [
      { name: "Gemini 3.5 Flash Lite", badge: "Ultra-Fast (~250ms)" },
      { name: "Gemini 3.7 Flash", badge: "Balanced (~800ms)" },
      { name: "DeepSeek V4 Pro", badge: "Deep Reasoning (~2.5s)" },
      { name: "Qwen 3.7 Plus", badge: "Balanced (~900ms)" },
      { name: "GPT-5.6 Luna", badge: "Deep Reasoning (~2.2s)" },
      { name: "Gemma 4 26B A4B IT", badge: "Low Latency (~350ms)" },
    ];

    for (const model of modelsToTest) {
      const cards = screen.getAllByText(model.name);
      fireEvent.click(cards[0]);
      expect(screen.getByText(new RegExp(`Selected: ${model.name}`, "i"))).toBeInTheDocument();
    }
  });

  it("handles Foot-Traffic category selection and custom focus prompt clear", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const trafficCard = screen.getByText("Foot-Traffic & Booth Optimization");
    fireEvent.click(trafficCard);

    expect(screen.getByText(/Generating with/i)).toHaveTextContent("Foot-Traffic & Booth Optimization");

    const input = screen.getByPlaceholderText(/e\.g\./i);
    fireEvent.change(input, { target: { value: "Examine Hall 1 bottleneck" } });
    expect(input).toHaveValue("Examine Hall 1 bottleneck");

    const clearBtn = screen.getByText("Clear");
    fireEvent.click(clearBtn);
    expect(input).toHaveValue("");
  });

  it("exports Markdown (.md) and JSON (.json) triggers Blob URL download correctly", async () => {
    // Mock fetch for successful generation
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get(name: string) {
            if (name === "x-report-metadata") {
              const mockMetadata = {
                summary: "Mock report export summary",
                sentimentScore: 0.95,
                footTrafficIndex: 4000,
                registrationVelocity: {
                  totalRegistrations: 5000,
                  totalCheckedIn: 4200,
                  checkInRatePercent: 84,
                  projectedFinalAttendance: 5500,
                },
                revenueMetrics: {
                  grossRevenue: 950000000,
                  currency: "IDR",
                  averageTicketValue: 190000,
                  topTierByRevenue: "VIP Pass",
                },
                topSessions: [{ title: "Keynote", attendance: 1000 }],
                keyHighlights: ["Highlight 1"],
                recommendedActions: ["Action 1", "Action 2"],
                modelUsed: "google/gemini-3.7-flash",
                generatedAt: new Date().toISOString(),
              };
              return Buffer.from(JSON.stringify(mockMetadata)).toString("base64");
            }
            return null;
          },
        },
        body: {
          getReader() {
            const encoder = new TextEncoder();
            let sent = false;
            return {
              read() {
                if (!sent) {
                  sent = true;
                  return Promise.resolve({
                    done: false,
                    value: encoder.encode("# Generated Report Content for Download"),
                  });
                }
                return Promise.resolve({ done: true, value: undefined });
              },
            };
          },
        },
      })
    );

    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const synthesizeBtn = screen.getByRole("button", { name: /Synthesize AI Report/i });
    fireEvent.click(synthesizeBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Export \.md/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Export JSON/i })).toBeInTheDocument();
    });

    // Test Export .md
    const exportMdBtn = screen.getByRole("button", { name: /Export \.md/i });
    fireEvent.click(exportMdBtn);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();

    // Test Export JSON
    const exportJsonBtn = screen.getByRole("button", { name: /Export JSON/i });
    fireEvent.click(exportJsonBtn);
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("handles network failure during report generation gracefully", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.reject(new Error("Network timeout / Connection refused"))
    );

    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const synthesizeBtn = screen.getByRole("button", { name: /Synthesize AI Report/i });
    fireEvent.click(synthesizeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Report Generation Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Network timeout \/ Connection refused/i)).toBeInTheDocument();
    });
  });

  it("handles malformed JSON in saved report history without unmounting", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    // Click malformed report history item
    const malformedItem = screen.getByText("SENTIMENT");
    fireEvent.click(malformedItem);

    // Should gracefully render the raw string fallback
    expect(screen.getByText(/INVALID_JSON_RAW_STRING_CONTENT/i)).toBeInTheDocument();
  });

  it("deletes a saved report from history", async () => {
    global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
      if (opts?.method === "DELETE") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ reports: [] }) });
    });

    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    expect(screen.getByText("2 reports archived")).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle("Delete report");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/ai/reports?reportId="), {
        method: "DELETE",
      });
    });
  });
});
