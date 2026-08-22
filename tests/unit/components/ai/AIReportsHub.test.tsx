import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { AIReportsHub } from "@/components/ai/AIReportsHub";
import { EventMetricsContext, SavedAIReportItem } from "@/lib/ai/types";

describe("AIReportsHub Component (Phase 10 Organizer AI Intelligence Hub)", () => {
  const sampleEvent: EventMetricsContext = {
    id: "evt-mfg-2026",
    title: "Manufacturing Indonesia 2026",
    slug: "manufacturing-indonesia-2026",
    tagline: "International Manufacturing Machinery and Automation Showcase",
    description: "The 34th International Manufacturing Exhibition.",
    archetype: "INDUSTRIAL_B2B",
    format: "IN_PERSON",
    scale: "GLOBAL_MEGA",
    startDate: "2026-12-02T02:00:00.000Z",
    endDate: "2026-12-05T11:00:00.000Z",
    venue: {
      id: "v-jiexpo",
      name: "JIExpo Kemayoran",
      city: "Jakarta",
      transitInfo: "TransJakarta Corridor 12 and KRL Commuter Line.",
    },
    venueHall: {
      id: "hall-a1",
      name: "Hall A1 (Machinery & Automation)",
      capacity: 6000,
    },
    totalBookings: 2400,
    totalCheckedIn: 1870,
    checkInRatePercent: 78,
    grossRevenue: 540000000,
    currency: "IDR",
    ticketTiers: [
      { id: "t1", name: "Standard Trade Pass", price: 0, currency: "IDR", capacity: 4000, soldCount: 2000 },
      { id: "t2", name: "VIP Executive Buyer", price: 750000, currency: "IDR", capacity: 500, soldCount: 400 },
    ],
    booths: [
      { id: "b1", companyName: "Siemens Factory Automation", boothNumber: "Hall A1-01", hallName: "Hall A1", industry: "Robotics" },
      { id: "b2", companyName: "Schneider Electric EcoStruxure", boothNumber: "Hall A2-14", hallName: "Hall A2", industry: "Energy" },
    ],
    agendaItems: [
      {
        id: "ag1",
        title: "Opening Plenary: Industrial AI & Smart Factories",
        speakerName: "Dr. Alex Pratama",
        location: "Plenary Stage - Hall D2",
        startTime: "2026-12-02T09:30:00.000Z",
        endTime: "2026-12-02T10:30:00.000Z",
      },
    ],
  };

  const sampleReports: SavedAIReportItem[] = [
    {
      id: "rep-1",
      eventId: "evt-mfg-2026",
      modelUsed: "google/gemini-3.7-flash",
      reportType: "DAILY_DIGEST",
      contentJson: JSON.stringify({
        markdownContent: "# Daily Executive Intelligence Digest\n\nArchived report text here.",
        structuredData: {
          summary: "Archived digest summary",
          sentimentScore: 0.92,
          footTrafficIndex: 1450,
          registrationVelocity: {
            totalRegistrations: 2400,
            totalCheckedIn: 1870,
            checkInRatePercent: 78,
            projectedFinalAttendance: 2600,
          },
          revenueMetrics: {
            grossRevenue: 540000000,
            currency: "IDR",
            averageTicketValue: 225000,
            topTierByRevenue: "VIP Executive Buyer",
          },
          topSessions: [{ title: "Opening Plenary", attendance: 920 }],
          keyHighlights: ["Archived highlight"],
          recommendedActions: ["Action 1", "Action 2"],
          modelUsed: "google/gemini-3.7-flash",
          generatedAt: new Date().toISOString(),
        },
      }),
      createdAt: new Date().toISOString(),
      author: {
        name: "Sari Dewi",
        email: "organizer@xpo.com",
      },
    },
  ];

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    // Mock fetch for reports generation
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get(name: string) {
            if (name === "x-report-metadata") {
              const mockMetadata = {
                summary: "Mock report summary",
                sentimentScore: 0.91,
                footTrafficIndex: 1200,
                registrationVelocity: {
                  totalRegistrations: 2400,
                  totalCheckedIn: 1870,
                  checkInRatePercent: 78,
                  projectedFinalAttendance: 2600,
                },
                revenueMetrics: {
                  grossRevenue: 540000000,
                  currency: "IDR",
                  averageTicketValue: 225000,
                  topTierByRevenue: "VIP Executive Buyer",
                },
                topSessions: [{ title: "Keynote Plenary", attendance: 800 }],
                keyHighlights: ["Test highlight"],
                recommendedActions: ["Recommendation 1", "Recommendation 2"],
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
                    value: encoder.encode("# Generated Report\n\nExecutive Intelligence content streamed."),
                  });
                }
                return Promise.resolve({ done: true, value: undefined });
              },
            };
          },
        },
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders event header, metrics banner, and all 6 OpenRouter models", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    expect(screen.getByText("Event Intelligence & Analytics Reports")).toBeInTheDocument();
    expect(screen.getByText(/2,400 delegates/i)).toBeInTheDocument();
    expect(screen.getByText(/78% \(1870\)/i)).toBeInTheDocument();

    // Verify 6 foundation models are present
    expect(screen.getByText("Gemini 3.5 Flash Lite")).toBeInTheDocument();
    expect(screen.getAllByText("Gemini 3.7 Flash").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("DeepSeek V4 Pro")).toBeInTheDocument();
    expect(screen.getByText("Qwen 3.7 Plus")).toBeInTheDocument();
    expect(screen.getByText("GPT-5.6 Luna")).toBeInTheDocument();
    expect(screen.getByText("Gemma 4 26B A4B IT")).toBeInTheDocument();
  });

  it("allows switching models and report types", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    // Click DeepSeek model card
    const deepseekCard = screen.getByText("DeepSeek V4 Pro");
    fireEvent.click(deepseekCard);

    expect(screen.getByText(/Selected: DeepSeek V4 Pro/i)).toBeInTheDocument();

    // Click Sentiment Report category card
    const sentimentCard = screen.getByText("Sentiment & Feedback Synthesis");
    fireEvent.click(sentimentCard);

    expect(screen.getByText(/Generating with/i)).toHaveTextContent("DeepSeek V4 Pro");
    expect(screen.getByText(/Generating with/i)).toHaveTextContent("Sentiment & Feedback Synthesis");
  });

  it("updates focus area with custom text and quick suggestions", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const input = screen.getByPlaceholderText(/e\.g\./i);
    fireEvent.change(input, { target: { value: "Analyze Hall A1 afternoon bottleneck" } });

    expect(input).toHaveValue("Analyze Hall A1 afternoon bottleneck");

    // Click a quick suggestion chip
    const quickChip = screen.getByRole("button", { name: /Summarize operational bottlenecks/i });
    fireEvent.click(quickChip);

    expect(input).toHaveValue("Summarize operational bottlenecks and gate check-in throughput.");
  });

  it("triggers report synthesis and renders streamed response", async () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const synthesizeBtn = screen.getByRole("button", { name: /Synthesize AI Report/i });
    fireEvent.click(synthesizeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Executive Intelligence content streamed/i)).toBeInTheDocument();
    });
  });

  it("copies generated markdown to clipboard", async () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    const synthesizeBtn = screen.getByRole("button", { name: /Synthesize AI Report/i });
    fireEvent.click(synthesizeBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Copy Markdown/i })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole("button", { name: /Copy Markdown/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });

  it("renders saved reports history and allows selecting archived reports", () => {
    render(<AIReportsHub event={sampleEvent} initialReports={sampleReports} />);

    expect(screen.getByText("Saved Reports History")).toBeInTheDocument();
    expect(screen.getByText("1 reports archived")).toBeInTheDocument();

    const historyCard = screen.getByText("DAILY DIGEST");
    fireEvent.click(historyCard);

    expect(screen.getByText(/Archived report text here/i)).toBeInTheDocument();
  });
});
