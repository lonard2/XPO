import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";

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
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: rating must be an integer from 1 to 5." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: request does not exist." },
        { status: 404 }
      );
    }

    const isRequester =
      (row.requesterId && row.requesterId === gate.caller.userId) ||
      (row.requesterEmail && row.requesterEmail === gate.caller.email);
    if (!isRequester && gate.caller.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: only the requester can rate this meeting." },
        { status: 403 }
      );
    }
    if (row.status !== "CONFIRMED" || row.outcome !== "HELD") {
      return NextResponse.json(
        { success: false, error: "CONFLICT: only a held meeting can be rated." },
        { status: 409 }
      );
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
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not save the rating." },
      { status: 500 }
    );
  }
}
