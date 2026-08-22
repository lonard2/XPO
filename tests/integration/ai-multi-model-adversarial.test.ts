import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET, DELETE } from "@/app/api/ai/reports/route";
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
  type ReportType,
} from "@/lib/ai/openrouter";
import {
  DailyExecutiveDigestSchema,
  SentimentFeedbackSchema,
  FootTrafficOptimizationSchema,
  REPORT_SCHEMAS,
} from "@/lib/ai/schemas";
import { EventMetricsContext } from "@/lib/ai/types";
import { db } from "@/lib/db";

describe("Milestone 7 Adversarial Stress Suite: OpenRouter Multi-Model & Schemas", () => {
  let realEvent: any;

  beforeAll(async () => {
    await db.$connect();
    realEvent = await db.event.findFirst({
      include: {
        venue: true,
        venueHall: true,
        ticketTiers: true,
        booths: true,
        agendaItems: true,
      },
    });
  });

  afterAll(async () => {
    if (realEvent) {
      await db.aIReport.deleteMany({
        where: {
          eventId: realEvent.id,
          contentJson: { contains: "AdversarialStressTest" },
        },
      });
    }
    await db.$disconnect();
  });

  // ==========================================================================
  // 1. ALL 6 MODELS x ALL 3 REPORT TYPES MATRIX TEST (18 PERMUTATIONS)
  // ==========================================================================
  describe("Model x ReportType Full Permutation Matrix (18 Combinations)", () => {
    const allModels: OpenRouterModel[] = [
      "google/gemini-3.5-flash-lite",
      "google/gemini-3.7-flash",
      "deepseek/deepseek-v4-pro-0813",
      "qwen/qwen3.7-plus",
      "openai/gpt-5.6-luna",
      "google/gemma-4-26b-a4b-it",
    ];

    const allReportTypes: ReportType[] = ["DAILY_DIGEST", "SENTIMENT", "FOOT_TRAFFIC"];

    for (const model of allModels) {
      for (const reportType of allReportTypes) {
        it(`synthesizes valid grounded structured data for model [${model}] with reportType [${reportType}]`, () => {
          const sampleContext: EventMetricsContext = {
            id: "evt-adv-matrix",
            title: "Global AI & MICE Summit 2026",
            slug: "global-ai-mice-summit-2026",
            description: "High-scale trade exhibition with diverse delegacy.",
            archetype: "TECH_AI_SUMMIT",
            format: "IN_PERSON",
            scale: "GLOBAL_MEGA",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            venue: {
              id: "v-bigsight",
              name: "Tokyo Big Sight",
              city: "Tokyo",
              transitInfo: "Yurikamome Line, Rinkai Line",
            },
            venueHall: {
              id: "hall-east-1",
              name: "East Exhibition Hall 1",
              capacity: 8000,
            },
            totalBookings: 3500,
            totalCheckedIn: 2900,
            checkInRatePercent: 83,
            grossRevenue: 120000000,
            currency: "JPY",
            ticketTiers: [
              { id: "tier-std", name: "General Pass", price: 10000, currency: "JPY", capacity: 5000, soldCount: 3000 },
              { id: "tier-vip", name: "VIP All-Access", price: 50000, currency: "JPY", capacity: 500, soldCount: 500 },
            ],
            booths: [
              { id: "b-sony", companyName: "Sony Robotics", boothNumber: "E1-01", hallName: "East Hall 1", industry: "AI Hardware" },
              { id: "b-panasonic", companyName: "Panasonic Green Tech", boothNumber: "E1-12", hallName: "East Hall 1", industry: "Energy" },
            ],
            agendaItems: [
              {
                id: "ag-keynote",
                title: "Opening Plenary: Neural Interfaces in Industrial Automation",
                speakerName: "Kenji Sato",
                location: "Main Plenary Stage",
                startTime: "09:00",
                endTime: "10:30",
                track: "Keynote",
              },
            ],
          };

          const structured = generateGroundedStructuredData(
            sampleContext,
            model,
            reportType,
            "Adversarial Matrix Verification"
          );

          expect(structured).toBeDefined();
          expect(structured.modelUsed).toBe(model);

          // Validate against exact Zod schema
          const schema = REPORT_SCHEMAS[reportType];
          const validated = schema.parse(structured);
          expect(validated).toBeDefined();

          // Validate Markdown generation
          const markdown = generateGroundedReportMarkdown(
            sampleContext,
            model,
            reportType,
            structured,
            "Adversarial Matrix Verification"
          );

          expect(markdown).toBeDefined();
          expect(markdown.length).toBeGreaterThan(150);
          expect(markdown).toContain(sampleContext.title);
          expect(markdown).toContain(OPENROUTER_MODEL_SPECS[model].displayName);
        });
      }
    }
  });

  // ==========================================================================
  // 2. EDGE CASE CONTEXTS & DATA INGESTION
  // ==========================================================================
  describe("Edge Case Context & Boundary Ingestion", () => {
    it("handles zero/empty contexts with graceful grounded fallbacks conforming to Zod schemas", () => {
      const zeroContext: EventMetricsContext = {
        id: "evt-zero",
        title: "Empty Ingestion Expo",
        slug: "empty-ingestion-expo",
        description: "Zero metrics baseline event.",
        archetype: "MEDICAL_HEALTHCARE",
        format: "HYBRID",
        scale: "SMALL",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        venue: {
          id: "v-empty",
          name: "Minimal Venue Center",
          city: "Bandung",
          transitInfo: "Local bus line",
        },
        venueHall: null,
        totalBookings: 0,
        totalCheckedIn: 0,
        checkInRatePercent: 0,
        grossRevenue: 0,
        currency: "IDR",
        ticketTiers: [],
        booths: [],
        agendaItems: [],
      };

      // Test Daily Digest fallback schema compliance
      const digest = generateGroundedStructuredData(zeroContext, "google/gemini-3.5-flash-lite", "DAILY_DIGEST");
      expect(digest.registrationVelocity.totalRegistrations).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(digest.registrationVelocity.checkInRatePercent)).toBe(false);
      expect(Number.isNaN(digest.revenueMetrics.averageTicketValue)).toBe(false);

      const parsedDigest = DailyExecutiveDigestSchema.parse(digest);
      expect(parsedDigest).toBeDefined();

      // Test Sentiment fallback schema compliance
      const sentiment = generateGroundedStructuredData(zeroContext, "deepseek/deepseek-v4-pro-0813", "SENTIMENT");
      expect(sentiment.sessionRatings.length).toBeGreaterThanOrEqual(1);
      const parsedSentiment = SentimentFeedbackSchema.parse(sentiment);
      expect(parsedSentiment).toBeDefined();

      // Test Foot Traffic fallback schema compliance
      const traffic = generateGroundedStructuredData(zeroContext, "openai/gpt-5.6-luna", "FOOT_TRAFFIC");
      expect(traffic.hallUtilization.length).toBeGreaterThanOrEqual(1);
      const parsedTraffic = FootTrafficOptimizationSchema.parse(traffic);
      expect(parsedTraffic).toBeDefined();
    });

    it("handles extreme numbers (10,000,000 delegates, trillions in gross revenue) safely", () => {
      const megaContext: EventMetricsContext = {
        id: "evt-mega-trillion",
        title: "World Expo 2026",
        slug: "world-expo-2026",
        description: "Mega multi-million attendee exhibition.",
        archetype: "MEGA_FAIR_JAKARTA",
        format: "IN_PERSON",
        scale: "GLOBAL_MEGA",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        venue: {
          id: "v-mega",
          name: "Mega Expo Grounds",
          city: "Jakarta",
          transitInfo: "Express Rail",
        },
        venueHall: { id: "hall-mega", name: "Grand Central Pavilion", capacity: 1000000 },
        totalBookings: 10000000,
        totalCheckedIn: 8500000,
        checkInRatePercent: 85,
        grossRevenue: 5000000000000, // 5 Trillion IDR
        currency: "IDR",
        ticketTiers: [
          { id: "t-mega", name: "Season Pass", price: 500000, currency: "IDR", capacity: 10000000, soldCount: 10000000 },
        ],
        booths: Array.from({ length: 50 }, (_, i) => ({
          id: `b-${i}`,
          companyName: `Exhibitor Corp ${i}`,
          boothNumber: `Hall Mega - Booth ${i + 1}`,
          hallName: "Grand Central Pavilion",
          industry: "International Trade",
        })),
        agendaItems: [
          {
            id: "ag-mega-1",
            title: "World Opening Ceremony",
            speakerName: "Global Heads of State",
            location: "Main Stadium",
            startTime: "09:00",
            endTime: "12:00",
          },
        ],
      };

      const digest = generateGroundedStructuredData(megaContext, "google/gemini-3.7-flash", "DAILY_DIGEST");
      expect(digest.registrationVelocity.totalRegistrations).toBe(10000000);
      expect(digest.revenueMetrics.grossRevenue).toBe(5000000000000);
      const parsed = DailyExecutiveDigestSchema.parse(digest);
      expect(parsed.registrationVelocity.totalRegistrations).toBe(10000000);
    });
  });

  // ==========================================================================
  // 3. SSE & READABLE STREAM INTEGRITY STRESS TESTS
  // ==========================================================================
  describe("ReadableStream Token Streaming Integrity", () => {
    it("emits non-empty text chunks with deterministic ordering and closes gracefully", async () => {
      const streamRes = await generateEventReportStream({
        event: {
          id: "evt-stream-test",
          title: "Streaming Benchmark Forum",
          slug: "streaming-benchmark-forum",
          description: "High concurrency token pipeline testing.",
          archetype: "TECH_AI_SUMMIT",
          format: "IN_PERSON",
          scale: "LARGE",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          venue: { id: "v1", name: "ICE BSD", city: "Tangerang", transitInfo: "KRL" },
          totalBookings: 1000,
          totalCheckedIn: 800,
          checkInRatePercent: 80,
          grossRevenue: 200000000,
          currency: "IDR",
          ticketTiers: [],
          booths: [],
          agendaItems: [],
        },
        model: "deepseek/deepseek-v4-pro-0813",
        reportType: "SENTIMENT",
      });

      expect(streamRes.stream).toBeInstanceOf(ReadableStream);
      const reader = streamRes.stream.getReader();
      const decoder = new TextDecoder();
      let totalChunks = 0;
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalChunks++;
        expect(value).toBeDefined();
        expect(value?.length).toBeGreaterThan(0);
        fullContent += decoder.decode(value, { stream: true });
      }

      expect(totalChunks).toBeGreaterThan(5);
      expect(fullContent).toContain("Streaming Benchmark Forum");
      expect(fullContent).toContain("DeepSeek V4 Pro");
    });

    it("verifies base64 metadata serialization and deserialization with Japanese & multilingual characters", () => {
      const sampleData = {
        title: "第34回 国際産業機械展 2026 (Tokyo Big Sight)",
        summary: "高精度ロボティクスと自動化技術の最新動向レポート。",
        currency: "JPY",
        sentimentScore: 0.95,
      };

      const base64Encoded = Buffer.from(JSON.stringify(sampleData), "utf-8").toString("base64");
      const decodedJson = JSON.parse(Buffer.from(base64Encoded, "base64").toString("utf-8"));

      expect(decodedJson.title).toBe(sampleData.title);
      expect(decodedJson.summary).toBe(sampleData.summary);
      expect(decodedJson.sentimentScore).toBe(0.95);
    });
  });

  // ==========================================================================
  // 4. API ROUTE SECURITY & PAYLOAD VALIDATION DEFENSE
  // ==========================================================================
  describe("API Route Hardening & Error Rejection (POST /api/ai/reports)", () => {
    it("rejects invalid/unsupported model strings with HTTP 400", async () => {
      const invalidModels = [
        "gpt-4",
        "claude-3-opus",
        "google/gemini-pro-unknown",
        "<script>alert(1)</script>",
        "../../etc/passwd",
        "",
      ];

      for (const badModel of invalidModels) {
        const req = new NextRequest("http://localhost:3000/api/ai/reports", {
          method: "POST",
          body: JSON.stringify({
            eventId: realEvent?.id || "evt-default",
            model: badModel,
            reportType: "DAILY_DIGEST",
          }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
      }
    });

    it("rejects invalid reportType with HTTP 400", async () => {
      const badReportTypes = ["UNKNOWN_TYPE", "FINANCIAL_FRAUD", "HACK_REPORT", ""];

      for (const badType of badReportTypes) {
        const req = new NextRequest("http://localhost:3000/api/ai/reports", {
          method: "POST",
          body: JSON.stringify({
            eventId: realEvent?.id || "evt-default",
            model: "google/gemini-3.7-flash",
            reportType: badType,
          }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
      }
    });

    it("rejects missing eventId with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/reports", {
        method: "POST",
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          reportType: "DAILY_DIGEST",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("handles non-existent eventId by providing graceful grounded fallback without crashing", async () => {
      const req = new NextRequest("http://localhost:3000/api/ai/reports", {
        method: "POST",
        body: JSON.stringify({
          eventId: "non-existent-event-id-999999",
          model: "qwen/qwen3.7-plus",
          reportType: "FOOT_TRAFFIC",
          focusArea: "Adversarial Non-Existent ID Test",
          saveToHistory: false,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("x-report-model")).toBe("qwen/qwen3.7-plus");
      expect(res.headers.get("x-report-type")).toBe("FOOT_TRAFFIC");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let output = "";
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }

      expect(output).toContain("Exhibition Foot-Traffic & Hall Density Diagnostic");
      expect(output).toContain("Qwen 3.7 Plus");
    });
  });

  // ==========================================================================
  // 5. LIVE & FALLBACK CHAT COMPLETION STREAMING
  // ==========================================================================
  describe("Chat Completion Streaming (Live & Offline Fallback)", () => {
    it("streams non-empty response content over ReadableStream for any supported model", async () => {
      const stream = await streamOpenRouterChat({
        model: "google/gemini-3.5-flash-lite",
        messages: [
          { role: "system", content: "You are the Concierge." },
          { role: "user", content: "Where is Hall A1?" },
        ],
      });

      expect(stream).toBeInstanceOf(ReadableStream);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text.length).toBeGreaterThan(10);
    });

    it("falls back to deterministic grounded stream when API key is unset/mocked", async () => {
      const originalKey = process.env.OPENROUTER_API_KEY;
      try {
        process.env.OPENROUTER_API_KEY = "mock-key-for-testing";
        const stream = await streamOpenRouterChat({
          model: "google/gemma-4-26b-a4b-it",
          messages: [
            { role: "system", content: "You are the Concierge." },
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
      } finally {
        process.env.OPENROUTER_API_KEY = originalKey;
      }
    });
  });
});
