import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { enforceRateLimit } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";
import { normalizeInterests, scoreEventsByInterests } from "@/lib/matching/suggest";
import { buildRerankSignals, rerankSuggestions, resolveRerankModel } from "@/lib/matching/rerank";

const LIMIT = 6;
const CANDIDATES = 50;

/**
 * GET /api/profile/suggestions — event suggestions for the signed-in user.
 * Rules always run first (direct archetype hit 2, same-cluster 1). With
 * `?rerank=true` the OpenRouter layer reorders those candidates using the
 * delegate's interests and past meeting outcomes, with plain-language
 * reasons; any failure falls back to the rule order. No interests stored
 * means no suggestions, never invented ones.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { searchParams } = new URL(request.url);
    const rerank = searchParams.get("rerank") === "true";
    const model = resolveRerankModel(searchParams.get("model"));
    if (searchParams.get("model") && !model) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: unknown model." },
        { status: 400 }
      );
    }

    // LLM calls cost money and time; the rule path stays unthrottled.
    let limitHeaders: Record<string, string> = {};
    if (rerank) {
      const limit = await enforceRateLimit("profile-suggestions-rerank", request, {
        limit: 10,
        windowMs: 60_000,
      });
      if (limit.response) return limit.response;
      limitHeaders = limit.headers;
    }

    const user = await db.user.findUnique({
      where: { id: gate.caller.userId as string },
      select: { interestsJson: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: user does not exist." },
        { status: 404 }
      );
    }

    let interests: string[] = [];
    try {
      interests = normalizeInterests(JSON.parse(user.interestsJson));
    } catch {
      interests = [];
    }
    if (interests.length === 0) {
      return NextResponse.json({ success: true, suggestions: [], rankedBy: "rules" });
    }

    const now = new Date();
    const events = await db.event.findMany({
      where: { isListingOnly: false, endDate: { gte: now } },
      orderBy: { startDate: "asc" },
      take: CANDIDATES,
      select: {
        id: true,
        title: true,
        slug: true,
        archetype: true,
        startDate: true,
        endDate: true,
        venue: { select: { name: true, city: true } },
      },
    });

    const scored = scoreEventsByInterests(events, interests).slice(0, LIMIT);
    if (!rerank) {
      return NextResponse.json({
        success: true,
        rankedBy: "rules",
        suggestions: scored.map(({ event, score, matchedInterests }) => ({
          event: {
            id: event.id,
            title: event.title,
            slug: event.slug,
            archetype: event.archetype,
            startDate: event.startDate,
            endDate: event.endDate,
            venueName: event.venue?.name || null,
            city: event.venue?.city || null,
          },
          score,
          matchedInterests,
        })),
      });
    }

    const signals = await buildRerankSignals(gate.caller.userId as string);
    const ranked = await rerankSuggestions(
      scored.map(({ event, score, matchedInterests }) => ({
        event,
        score,
        matchedInterests,
        title: event.title,
        venue: [event.venue?.name, event.venue?.city].filter(Boolean).join(", "),
      })),
      signals,
      model ?? undefined
    );

    return NextResponse.json(
      {
        success: true,
        rankedBy: ranked.rankedBy,
        modelUsed: ranked.modelUsed,
        suggestions: ranked.items.map(({ event, score, matchedInterests, reason }) => ({
          event: {
            id: event.id,
            title: event.title,
            slug: event.slug,
            archetype: event.archetype,
            startDate: event.startDate,
            endDate: event.endDate,
            venueName: event.venue?.name || null,
            city: event.venue?.city || null,
          },
          score,
          matchedInterests,
          reason,
        })),
      },
      { headers: limitHeaders }
    );
  } catch (error) {
    reportError("profile-suggestions", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not load suggestions." },
      { status: 500 }
    );
  }
}
