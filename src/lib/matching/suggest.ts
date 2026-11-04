import {
  MICE_INDUSTRY_CLUSTERS,
  type MiceArchetype,
} from "@/lib/theming";

/** Every interest id the profile form can submit. */
export const VALID_INTERESTS: ReadonlySet<string> = new Set(
  MICE_INDUSTRY_CLUSTERS.flatMap((cluster) => cluster.archetypes)
);

function clusterOf(archetype: string): string | null {
  for (const cluster of MICE_INDUSTRY_CLUSTERS) {
    if ((cluster.archetypes as readonly string[]).includes(archetype)) {
      return cluster.id;
    }
  }
  return null;
}

/** Keep only known archetype ids, deduplicated, order preserved. */
export function normalizeInterests(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item === "string" && VALID_INTERESTS.has(item) && !seen.has(item)) {
      seen.add(item);
    }
  }
  return [...seen];
}

export interface SuggestableEvent {
  id: string;
  archetype: string;
}

export interface ScoredSuggestion<T extends SuggestableEvent> {
  event: T;
  score: number;
  matchedInterests: MiceArchetype[];
}

/**
 * Rule-based matcher, deliberately not AI: a direct archetype hit scores 2,
 * a same-cluster hit scores 1. Auditable by construction — every point maps
 * to a named interest. AI re-ranking (roadmap M3) consumes this output, never
 * replaces it.
 */
export function scoreEventsByInterests<T extends SuggestableEvent>(
  events: T[],
  interests: string[]
): Array<ScoredSuggestion<T>> {
  const normalized = normalizeInterests(interests);
  if (normalized.length === 0) return [];

  const interestClusters = new Map<string, string | null>();
  for (const interest of normalized) {
    interestClusters.set(interest, clusterOf(interest));
  }

  const scored: Array<ScoredSuggestion<T>> = [];
  for (const event of events) {
    const matched: MiceArchetype[] = [];
    let score = 0;
    for (const interest of normalized) {
      if (event.archetype === interest) {
        score += 2;
        matched.push(interest as MiceArchetype);
      } else {
        const cluster = interestClusters.get(interest);
        if (cluster && cluster === clusterOf(event.archetype)) {
          score += 1;
          if (!matched.includes(interest as MiceArchetype)) {
            matched.push(interest as MiceArchetype);
          }
        }
      }
    }
    if (score > 0) {
      scored.push({ event, score, matchedInterests: matched });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}
