import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/meetings/requests/[id]/rating — the requester rates a held
 * meeting from 1 to 5. Only the requester's own held meeting, and only once
 * the organizer recorded it as held. Rewritable: the latest rating stands.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return apiError("VALIDATION_ERROR: rating must be an integer from 1 to 5.", 400);
    }

    const row = await db.meetingRequest.findUnique({
      where: { id },
      select: {
        id: true,
        eventId: true,
        status: true,
        outcome: true,
        requesterId: true,
        requesterEmail: true,
      },
    });
    if (!row) {
      return apiError("NOT_FOUND: request does not exist.", 404);
    }

    const isRequester =
      (row.requesterId && row.requesterId === gate.caller.userId) ||
      (row.requesterEmail && row.requesterEmail === gate.caller.email);
    if (!isRequester && gate.caller.role !== "ADMIN") {
      return apiError("Forbidden: only the requester can rate this meeting.", 403);
    }
    if (row.status !== "CONFIRMED" || row.outcome !== "HELD") {
      return apiError("CONFLICT: only a held meeting can be rated.", 409);
    }

    const updated = await db.meetingRequest.update({
      where: { id },
      data: { rating },
      select: { id: true, rating: true },
    });

    await audit(request, {
      action: "meeting.rate",
      entity: "MeetingRequest",
      entityId: id,
      metadata: { eventId: row.eventId, rating },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    reportError("meeting-rating", error);
    return apiError("INTERNAL_ERROR: could not save the rating.", 500);
  }
}
