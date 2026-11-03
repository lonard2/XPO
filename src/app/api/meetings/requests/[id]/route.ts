import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { sendEmail } from "@/lib/email/transport";
import {
  renderMeetingRequestDecision,
  type MeetingRequestType,
} from "@/lib/email/templates";

const DECISIONS = ["CONFIRMED", "DECLINED"] as const;
type Decision = (typeof DECISIONS)[number];

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/meetings/requests/[id] — accept or decline a request.
 * Only the organizer who owns the parent event, or an admin, may decide.
 * The requester is emailed; a mail failure never undoes the decision.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const status = typeof body.status === "string" ? body.status.toUpperCase() : "";

    if (!(DECISIONS as readonly string[]).includes(status)) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: status must be CONFIRMED or DECLINED." },
        { status: 400 }
      );
    }

    const row = await db.meetingRequest.findUnique({
      where: { id },
      include: { event: { select: { id: true, title: true, organizerId: true } } },
    });
    if (!row) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: request does not exist." },
        { status: 404 }
      );
    }
    if (!canWriteEvent(gate.caller, row.event.organizerId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: only the owning organizer can decide this request." },
        { status: 403 }
      );
    }

    const updated = await db.meetingRequest.update({
      where: { id },
      data: { status },
    });

    await audit(request, {
      action: `meeting.${status.toLowerCase()}`,
      entity: "MeetingRequest",
      entityId: id,
      metadata: { eventId: row.eventId, type: row.type },
    });

    try {
      const mail = renderMeetingRequestDecision({
        type: row.type as MeetingRequestType,
        eventTitle: row.event.title,
        requesterName: row.requesterName,
        target: row.target,
        slot: row.slot,
        message: row.message,
        reference: row.id,
        status: status as Decision,
      });
      await sendEmail({ to: row.requesterEmail, ...mail });
    } catch (mailError) {
      reportError("meetings-decision-email", mailError, { requestId: id });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    reportError("meetings-decision", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not update the request." },
      { status: 500 }
    );
  }
}
