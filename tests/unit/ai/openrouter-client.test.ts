import { describe, it, expect } from "vitest";
import {
  OPENROUTER_MODEL_SPECS,
  getAvailableModels,
  getModelSpec,
  isValidOpenRouterModel,
  generateGroundedStructuredData,
  generateGroundedReportMarkdown,
  generateEventReportStream,
  streamOpenRouterChat,
  generateStructuredReport,
  type OpenRouterModel,
} from "@/lib/ai/openrouter";
import {
  DailyExecutiveDigestSchema,
  SentimentFeedbackSchema,
  FootTrafficOptimizationSchema,
} from "@/lib/ai/schemas";
import { EventMetricsContext } from "@/lib/ai/types";

describe("Phase 10 Unit: OpenRouter Multi-Model Client & Streaming Generator", () => {
  const sampleEventContext: EventMetricsContext = {
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

  it("verifies all 6 OpenRouter models are registered and valid", () => {
    const models = getAvailableModels();
    expect(models.length).toBe(6);

    const expectedModelIds: OpenRouterModel[] = [
      "google/gemini-3.5-flash-lite",
      "google/gemini-3.7-flash",
      "deepseek/deepseek-v4-pro-0813",
      "qwen/qwen3.7-plus",
      "openai/gpt-5.6-luna",
      "google/gemma-4-26b-a4b-it",
    ];

    for (const modelId of expectedModelIds) {
      expect(isValidOpenRouterModel(modelId)).toBe(true);
      const spec = getModelSpec(modelId);
      expect(spec.displayName).toBeDefined();
      expect(spec.strengths.length).toBeGreaterThanOrEqual(3);
      expect(spec.contextWindow).toBeGreaterThanOrEqual(64000);
    }
  });

  it("throws descriptive error when unsupported model is requested in getModelSpec", () => {
    expect(() => getModelSpec("unsupported/unknown-model" as any)).toThrow(
      "Unsupported OpenRouter model requested"
    );
  });

  it("generates grounded DailyExecutiveDigest structured data conforming to Zod schema", () => {
    const data = generateGroundedStructuredData(
      sampleEventContext,
      "google/gemini-3.7-flash",
      "DAILY_DIGEST",
      "Afternoon Keynote Velocity"
    );

    const validated = DailyExecutiveDigestSchema.parse(data);
    expect(validated.modelUsed).toBe("google/gemini-3.7-flash");
    expect(validated.registrationVelocity.totalRegistrations).toBe(2400);
    expect(validated.registrationVelocity.totalCheckedIn).toBe(1870);
    expect(validated.revenueMetrics.grossRevenue).toBe(540000000);
    expect(validated.topSessions.length).toBeGreaterThanOrEqual(1);
    expect(validated.recommendedActions.length).toBeGreaterThanOrEqual(2);
  });

  it("generates grounded SentimentFeedback structured data conforming to Zod schema", () => {
    const data = generateGroundedStructuredData(
      sampleEventContext,
      "deepseek/deepseek-v4-pro-0813",
      "SENTIMENT"
    );

    const validated = SentimentFeedbackSchema.parse(data);
    expect(validated.modelUsed).toBe("deepseek/deepseek-v4-pro-0813");
    expect(validated.attendeeSatisfactionIndex).toBeGreaterThanOrEqual(0);
    expect(validated.attendeeSatisfactionIndex).toBeLessThanOrEqual(100);
    expect(validated.positiveThemes.length).toBeGreaterThanOrEqual(1);
    expect(validated.criticalConcerns.length).toBeGreaterThanOrEqual(1);
  });

  it("generates grounded FootTrafficOptimization structured data conforming to Zod schema", () => {
    const data = generateGroundedStructuredData(
      sampleEventContext,
      "openai/gpt-5.6-luna",
      "FOOT_TRAFFIC"
    );

    const validated = FootTrafficOptimizationSchema.parse(data);
    expect(validated.modelUsed).toBe("openai/gpt-5.6-luna");
    expect(["LOW", "MODERATE", "HIGH", "CRITICAL"]).toContain(validated.overallCongestionLevel);
    expect(validated.hallUtilization.length).toBeGreaterThanOrEqual(1);
    expect(validated.bottleneckLocations.length).toBeGreaterThanOrEqual(1);
  });

  it("generates publication-grade Markdown text with table matrices and action items", () => {
    const structured = generateGroundedStructuredData(
      sampleEventContext,
      "google/gemini-3.7-flash",
      "DAILY_DIGEST"
    );

    const md = generateGroundedReportMarkdown(
      sampleEventContext,
      "google/gemini-3.7-flash",
      "DAILY_DIGEST",
      structured
    );

    expect(md).toContain("# Daily Executive Intelligence Digest");
    expect(md).toContain("Manufacturing Indonesia 2026");
    expect(md).toContain("JIExpo Kemayoran");
    expect(md).toContain("Gemini 3.7 Flash");
    expect(md).toContain("Key Performance Indicators");
    expect(md).toContain("Recommended Action Items");
  });

  it("streams event report tokens via ReadableStream", async () => {
    const { stream, structuredData, markdownContent } = await generateEventReportStream({
      event: sampleEventContext,
      model: "qwen/qwen3.7-plus",
      reportType: "DAILY_DIGEST",
    });

    expect(stream).toBeInstanceOf(ReadableStream);
    expect(structuredData).toBeDefined();
    expect(markdownContent.length).toBeGreaterThan(100);

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let streamedOutput = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      streamedOutput += decoder.decode(value, { stream: true });
    }

    expect(streamedOutput).toContain("Manufacturing Indonesia 2026");
    expect(streamedOutput).toContain("Qwen 3.7 Plus");
  });

  it("streams chat tokens via streamOpenRouterChat ReadableStream", async () => {
    const stream = await streamOpenRouterChat({
      model: "google/gemma-4-26b-a4b-it",
      messages: [
        { role: "system", content: "You are the AI analyst." },
        { role: "user", content: "What is the check-in count?" },
      ],
    });

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("Welcome to XPO MICE Concierge powered by google/gemma-4-26b-a4b-it");
  });

  it("generates structured report using generateStructuredReport helper with schema validation", async () => {
    const report = await generateStructuredReport({
      model: "google/gemini-3.5-flash-lite",
      prompt: "Manufacturing Indonesia 2026 Day 1 Overview",
      schema: DailyExecutiveDigestSchema,
    });

    expect(report.sentimentScore).toBeGreaterThanOrEqual(0);
    expect(report.sentimentScore).toBeLessThanOrEqual(1);
    expect(report.modelUsed).toBe("google/gemini-3.5-flash-lite");
    expect(report.topSessions.length).toBeGreaterThanOrEqual(1);
  });
});
