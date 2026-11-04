import { z } from "zod";
import { db } from "@/lib/db";
import {
  isValidOpenRouterModel,
  type OpenRouterModel,
} from "@/lib/ai/openrouter";
import {
  normalizeInterests,
  type ScoredSuggestion,
  type SuggestableEvent,
} from "./suggest";

export const DEFAULT_RERANK_MODEL: OpenRouterModel = "google/gemini-3.5-flash-lite";
const MAX_REASON = 200;

const RerankResponseSchema = z.object({
  rankings: z
    .array(
      z.object({
        eventId: z.string().min(1),
        // Generous ceiling: display text is capped to MAX_REASON in code.
        reason: z.string().min(1).max(2000),
      })
    )
    .max(25),
});

export type RerankedItem = {
  eventId: string;
  reason: string;
};

export interface RerankSignals {
  interests: string[];
  /** Past meeting outcomes, e.g. { type: "DEAL_SLOT", status: "CONFIRMED", count: 2 }. */
  meetingOutcomes: Array<{ type: string; status: string; count: number }>;
  /** Archetypes of events the delegate already booked. */
  bookedArchetypes: string[];
  /** Industries of booths the delegate claimed as an exhibitor. */
  claimedIndustries: string[];
}

/**
 * What the delegate's history says, in one cheap read batch. M2 outcomes
 * are the signal: confirmed and declined requests reveal what the delegate
 * actually wants, beyond what they ticked in settings.
 */
export async function buildRerankSignals(userId: string): Promise<RerankSignals> {
  const [user, requests, bookings, booths] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { interestsJson: true } }),
    db.meetingRequest.findMany({
      where: { requesterId: userId },
      select: { type: true, status: true },
      take: 100,
    }),
    db.booking.findMany({
      where: { userId, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
      include: { event: { select: { archetype: true } } },
      take: 50,
    }),
    db.boothTenant.findMany({
      where: { userId, claimStatus: "CLAIMED" },
      select: { industry: true },
      take: 25,
    }),
  ]);

  let interests: string[] = [];
  try {
    interests = normalizeInterests(JSON.parse(user?.interestsJson || "[]"));
  } catch {
    interests = [];
  }

  const outcomeCounts = new Map<string, number>();
  for (const request of requests) {
    const key = `${request.type}|${request.status}`;
    outcomeCounts.set(key, (outcomeCounts.get(key) ?? 0) + 1);
  }
  const meetingOutcomes = [...outcomeCounts.entries()].map(([key, count]) => {
    const [type, status] = key.split("|");
    return { type, status, count };
  });

  return {
    interests,
    meetingOutcomes,
    bookedArchetypes: [...new Set(bookings.map((b) => b.event.archetype))].slice(0, 10),
    claimedIndustries: [
      ...new Set(booths.map((b) => b.industry).filter((i): i is string => Boolean(i))),
    ].slice(0, 10),
  };
}

function liveKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY;
  if (key && !key.startsWith("mock-") && key.length > 10) return key;
  return null;
}

function ruleReason(matchedInterests: string[]): string {
  return `Matches ${matchedInterests.join(", ")}`;
}

function buildPrompt<T extends SuggestableEvent>(
  candidates: Array<ScoredSuggestion<T> & { title: string; venue: string }>,
  signals: RerankSignals
): string {
  const lines = [
    "You rank MICE event suggestions for one delegate. Rank ONLY the events listed below, by eventId. Never invent events.",
    `Delegate interests: ${signals.interests.join(", ") || "none stored"}.`,
  ];
  if (signals.meetingOutcomes.length > 0) {
    lines.push(
      "Past meeting requests: " +
        signals.meetingOutcomes
          .map((o) => `${o.count}x ${o.type} ${o.status}`)
          .join("; ") +
        ". Treat CONFIRMED as interest shown and DECLINED as interest rejected for that request type."
    );
  }
  if (signals.bookedArchetypes.length > 0) {
    lines.push(`Already booked event types: ${signals.bookedArchetypes.join(", ")}.`);
  }
  if (signals.claimedIndustries.length > 0) {
    lines.push(`Exhibits in: ${signals.claimedIndustries.join(", ")}.`);
  }
  lines.push("Candidates (rule score first, higher means stronger interest match):");
  for (const candidate of candidates) {
    lines.push(
      `- ${candidate.event.id}: "${candidate.title}" (${candidate.event.archetype}, ${candidate.venue}) rule score ${candidate.score}, matched ${candidate.matchedInterests.join(", ")}`
    );
  }
  lines.push(
    'Return JSON {"rankings": [{"eventId": "...", "reason": "..."}]}. One plain-language sentence per reason, referencing the delegate\u2019s interests or history. No markdown, no extra keys.'
  );
  return lines.join("\n");
}

export interface RerankResult<T> {
  items: Array<{ event: T; score: number; matchedInterests: string[]; reason: string }>;
  rankedBy: "rules" | "ai";
  modelUsed: string | null;
}

/**
 * Re-rank rule-scored candidates through the OpenRouter layer. The rules
 * always run first and the model only reorders: unknown ids are dropped,
 * unranked candidates keep their relative rule order, reasons are capped.
 * Without a live key (or on any failure) the rule order stands with
 * rule-derived reasons, so suggestions never depend on AI availability.
 */
export async function rerankSuggestions<T extends SuggestableEvent & { id: string }>(
  candidates: Array<ScoredSuggestion<T> & { title: string; venue: string }>,
  signals: RerankSignals,
  model: OpenRouterModel = DEFAULT_RERANK_MODEL
): Promise<RerankResult<T>> {
  const ruleItems = candidates.map(({ event, score, matchedInterests }) => ({
    event,
    score,
    matchedInterests: [...matchedInterests],
    reason: ruleReason([...matchedInterests]),
  }));

  const key = liveKey();
  if (!key || candidates.length === 0) {
    return { items: ruleItems, rankedBy: "rules", modelUsed: null };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://xpo-mice.com",
        "X-Title": "XPO MICE Digital Ecosystem",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You rank event suggestions. Return only valid JSON adhering to the requested schema, without markdown code blocks.",
          },
          { role: "user", content: buildPrompt(candidates, signals) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter ${response.status}`);

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty completion");
    const parsed = RerankResponseSchema.parse(JSON.parse(content));

    const byId = new Map(candidates.map((c) => [c.event.id, c]));
    const seen = new Set<string>();
    const items: RerankResult<T>["items"] = [];
    for (const ranking of parsed.rankings) {
      const candidate = byId.get(ranking.eventId);
      if (!candidate || seen.has(ranking.eventId)) continue;
      seen.add(ranking.eventId);
      items.push({
        event: candidate.event,
        score: candidate.score,
        matchedInterests: [...candidate.matchedInterests],
        reason: ranking.reason.slice(0, MAX_REASON),
      });
    }
    for (const candidate of candidates) {
      if (seen.has(candidate.event.id)) continue;
      items.push({
        event: candidate.event,
        score: candidate.score,
        matchedInterests: [...candidate.matchedInterests],
        reason: ruleReason([...candidate.matchedInterests]),
      });
    }
    return { items, rankedBy: "ai", modelUsed: model };
  } catch {
    return { items: ruleItems, rankedBy: "rules", modelUsed: null };
  }
}

export function resolveRerankModel(value: unknown): OpenRouterModel | null {
  if (typeof value !== "string" || !value) return DEFAULT_RERANK_MODEL;
  return isValidOpenRouterModel(value) ? value : null;
}
