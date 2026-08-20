import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  generateStructuredReport,
  streamOpenRouterChat,
  OPENROUTER_MODEL_SPECS,
  type OpenRouterModel,
  type ChatMessage,
} from "../../helpers/contracts";

describe("Phase 10 Unit: OpenRouter Multi-Model AI Gateway & Reports", () => {
  const allModels: OpenRouterModel[] = [
    "google/gemini-3.5-flash-lite",
    "google/gemini-3.7-flash",
    "deepseek/deepseek-v4-pro-0813",
    "qwen/qwen3.7-plus",
    "openai/gpt-5.6-luna",
    "google/gemma-4-26b-a4b-it",
  ];

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================================================

  it("T1.1: verifies all 6 specified OpenRouter models are registered with performance metadata", () => {
    for (const modelId of allModels) {
      const spec = OPENROUTER_MODEL_SPECS[modelId];
      expect(spec).toBeDefined();
      expect(spec.displayName.length).toBeGreaterThan(0);
      expect(["fast", "medium", "deep"]).toContain(spec.latencyClass);
      expect(spec.contextWindow).toBeGreaterThanOrEqual(64000);
      expect(spec.primaryCapability.length).toBeGreaterThan(0);
    }
  });

  it("T1.2: generates structured executive report with strict Zod schema validation", async () => {
    const ExecutiveDigestSchema = z.object({
      summary: z.string(),
      sentimentScore: z.number().min(0).max(1),
      footTrafficIndex: z.number().positive(),
      topSessions: z.array(
        z.object({
          title: z.string(),
          attendance: z.number(),
        })
      ),
      recommendedActions: z.array(z.string()),
      modelUsed: z.string(),
      generatedAt: z.string(),
    });

    const report = await generateStructuredReport({
      model: "google/gemini-3.7-flash",
      prompt: "Manufacturing Indonesia 2026 Day 1 Overview",
      schema: ExecutiveDigestSchema,
    });

    expect(report.sentimentScore).toBeGreaterThanOrEqual(0);
    expect(report.sentimentScore).toBeLessThanOrEqual(1);
    expect(report.topSessions.length).toBeGreaterThan(0);
    expect(report.modelUsed).toBe("google/gemini-3.7-flash");
    expect(report.recommendedActions.length).toBeGreaterThanOrEqual(2);
  });

  it("T1.3: streams chat completion tokens as a Web ReadableStream", async () => {
    const messages: ChatMessage[] = [
      { role: "system", content: "You are the attendee AI concierge for JIExpo Kemayoran." },
      { role: "user", content: "Where is the VIP barista lounge?" },
    ];

    const stream = await streamOpenRouterChat({
      model: "google/gemini-3.5-flash-lite",
      messages,
    });

    expect(stream).toBeInstanceOf(ReadableStream);

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulatedText += decoder.decode(value, { stream: true });
    }

    expect(accumulatedText).toContain("Welcome to XPO MICE Concierge");
    expect(accumulatedText).toContain("google/gemini-3.5-flash-lite");
  });

  it("T1.4: verifies model routing recommendations match workload characteristics", () => {
    // Fast model for real-time concierge
    expect(OPENROUTER_MODEL_SPECS["google/gemini-3.5-flash-lite"].latencyClass).toBe("fast");
    // Deep reasoning for financial/anomaly audit
    expect(OPENROUTER_MODEL_SPECS["deepseek/deepseek-v4-pro-0813"].latencyClass).toBe("deep");
    // Multilingual trade for Asian regional cross-border commerce
    expect(OPENROUTER_MODEL_SPECS["qwen/qwen3.7-plus"].primaryCapability).toContain("Multilingual");
  });

  it("T1.5: validates sentiment analysis report schema with numerical boundary constraints", async () => {
    const SentimentReportSchema = z.object({
      sentimentScore: z.number().min(0).max(1),
      summary: z.string(),
      modelUsed: z.string(),
    });

    const result = await generateStructuredReport({
      model: "deepseek/deepseek-v4-pro-0813",
      prompt: "Attendee Social Sentiment and Feedback",
      schema: SentimentReportSchema,
    });

    expect(result.sentimentScore).toBe(0.92);
    expect(result.modelUsed).toBe("deepseek/deepseek-v4-pro-0813");
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & ADVERSARIAL EDGE CASES
  // ==========================================================================

  it("T2.1 (Error Handling): rejects unsupported model ID with explicit error message", async () => {
    const SimpleSchema = z.object({ summary: z.string() });
    const unsupportedModel = "unknown/nonexistent-model" as OpenRouterModel;

    await expect(
      generateStructuredReport({
        model: unsupportedModel,
        prompt: "Generate report",
        schema: SimpleSchema,
      })
    ).rejects.toThrow("Unsupported OpenRouter model requested");
  });

  it("T2.2 (Schema Violation): throws ZodError when schema expects missing mandatory fields", async () => {
    const StrictUnmatchedSchema = z.object({
      requiredNonExistentField123: z.string(),
    });

    await expect(
      generateStructuredReport({
        model: "openai/gpt-5.6-luna",
        prompt: "Generate test",
        schema: StrictUnmatchedSchema,
      })
    ).rejects.toThrow();
  });
});
