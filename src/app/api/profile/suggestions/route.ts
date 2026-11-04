import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { reportError } from "@/lib/observability/logger";
import { normalizeInterests, scoreEventsByInterests } from "@/lib/matching/suggest";

const LIMIT = 6;
const CANDIDATES = 50;

/**
 * GET /api/profile/suggestions — rule-based event suggestions for the
 * signed-in user. Scores upcoming operational events against the stored
 * interests: direct archetype hit counts 2, same-cluster counts 1. No
 * interests stored means no suggestions, never invented ones.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
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
      return NextResponse.json({ success: true, suggestions: [] });
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

    const suggestions = scoreEventsByInterests(events, interests)
      .slice(0, LIMIT)
      .map(({ event, score, matchedInterests }) => ({
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
      }));

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    reportError("profile-suggestions", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not load suggestions." },
      { status: 500 }
    );
  }
}
