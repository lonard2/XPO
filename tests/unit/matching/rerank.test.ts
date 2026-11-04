import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  rerankSuggestions,
  resolveRerankModel,
  DEFAULT_RERANK_MODEL,
  type RerankSignals,
} from "@/lib/matching/rerank";
import type { MiceArchetype } from "@/lib/theming";

const candidates = [
  {
    event: { id: "ev-tech", archetype: "TECH_DEV_SUMMIT" },
    score: 4,
    matchedInterests: ["TECH_DEV_SUMMIT" as MiceArchetype],
    title: "Tech Summit",
    venue: "ICE BSD City",
  },
  {
    event: { id: "ev-media", archetype: "MEDIA_BROADCAST" },
    score: 1,
    matchedInterests: ["TECH_DEV_SUMMIT" as MiceArchetype],
    title: "Media Expo",
    venue: "JIExpo",
  },
];

const signals: RerankSignals = {
  interests: ["TECH_DEV_SUMMIT"],
  meetingOutcomes: [{ type: "DEAL_SLOT", status: "CONFIRMED", count: 2 }],
  bookedArchetypes: ["TECH_DEV_SUMMIT"],
  claimedIndustries: [],
};

describe("suggestion re-ranking", () => {
  const realKey = process.env.OPENROUTER_API_KEY;
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    if (realKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = realKey;
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("resolves the default, a valid, and an invalid model", () => {
    expect(resolveRerankModel(undefined)).toBe(DEFAULT_RERANK_MODEL);
    expect(resolveRerankModel("")).toBe(DEFAULT_RERANK_MODEL);
    expect(resolveRerankModel("google/gemini-3.7-flash")).toBe("google/gemini-3.7-flash");
    expect(resolveRerankModel("not-a-model")).toBeNull();
  });

  it("keeps the rule order with rule reasons when no live key exists", async () => {
    const result = await rerankSuggestions(candidates, signals);
    expect(result.rankedBy).toBe("rules");
    expect(result.modelUsed).toBeNull();
    expect(result.items.map((item) => item.event.id)).toEqual(["ev-tech", "ev-media"]);
    expect(result.items[0].reason).toContain("TECH_DEV_SUMMIT");
  });

  it("treats mock keys as no key", async () => {
    process.env.OPENROUTER_API_KEY = "mock-test-key";
    const result = await rerankSuggestions(candidates, signals);
    expect(result.rankedBy).toBe("rules");
  });

  it("applies the model order, drops invented ids, and caps reasons", async () => {
    process.env.OPENROUTER_API_KEY = "live-test-key-long-enough";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  rankings: [
                    { eventId: "ev-media", reason: "x".repeat(600) },
                    { eventId: "ev-invented", reason: "A hallucinated event." },
                    { eventId: "ev-tech", reason: "Direct interest match." },
                  ],
                }),
              },
            },
          ],
        }),
    }) as any;

    const result = await rerankSuggestions(candidates, signals);
    expect(result.rankedBy).toBe("ai");
    expect(result.modelUsed).toBe(DEFAULT_RERANK_MODEL);
    expect(result.items.map((item) => item.event.id)).toEqual(["ev-media", "ev-tech"]);
    expect(result.items[0].reason).toHaveLength(200);
    expect(result.items[1].reason).toBe("Direct interest match.");
  });

  it("falls back to rules when the provider fails or lies", async () => {
    process.env.OPENROUTER_API_KEY = "live-test-key-long-enough";
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("down"));
    const failed = await rerankSuggestions(candidates, signals);
    expect(failed.rankedBy).toBe("rules");
    expect(failed.items.map((item) => item.event.id)).toEqual(["ev-tech", "ev-media"]);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "not json at all" } }],
        }),
    }) as any;
    const invalid = await rerankSuggestions(candidates, signals);
    expect(invalid.rankedBy).toBe("rules");
  });
});
