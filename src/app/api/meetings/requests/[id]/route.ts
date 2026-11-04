import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { sendEmail } from "@/lib/email/transport";
import {
  renderMeetingRequestDecision,
  renderMeetingRequestRescheduled,
  type MeetingRequestType,
} from "@/lib/email/templates";

const DECISIONS = ["CONFIRMED", "DECLINED"] as const;
type Decision = (typeof DECISIONS)[number];

const OUTCOMES = ["HELD", "NO_SHOW"] as const;

const MAX_LOCATION = 200;

function formatSchedule(date: Date): string {
  return (
    date.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }) + " UTC"
  );
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/meetings/requests/[id] — accept, decline, or schedule a request.
 * Only the organizer who owns the parent event, or an admin, may decide.
 * The requester is emailed; a mail failure never undoes the decision.
 *
 * `status` is optional: omitting it updates the schedule on an already
 * confirmed request (reschedule). Declining clears any schedule.
 * `scheduledAt` must be an ISO datetime inside the event window.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const rawStatus = typeof body.status === "string" ? body.status.toUpperCase() : "";
    const status = rawStatus || null;

    if (status && !(DECISIONS as readonly string[]).includes(status)) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: status must be CONFIRMED or DECLINED." },
        { status: 400 }
      );
    }

    const location =
      typeof body.location === "string" ? body.location.trim().slice(0, MAX_LOCATION) : null;

    const rawOutcome = typeof body.outcome === "string" ? body.outcome.toUpperCase() : "";
    const outcome = rawOutcome || null;
    if (outcome && !(OUTCOMES as readonly string[]).includes(outcome)) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: outcome must be HELD or NO_SHOW." },
        { status: 400 }
      );
    }

    let scheduledAt: Date | null | undefined;
    if (body.scheduledAt !== undefined) {
      if (typeof body.scheduledAt !== "string" || !body.scheduledAt) {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: scheduledAt must be an ISO datetime." },
          { status: 400 }
        );
      }
      const parsed = new Date(body.scheduledAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: scheduledAt must be an ISO datetime." },
          { status: 400 }
        );
      }
      scheduledAt = parsed;
    }

    const row = await db.meetingRequest.findUnique({
      where: { id },
      include: {
        event: {
          select: { id: true, title: true, organizerId: true, startDate: true, endDate: true },
        },
        booking: { select: { id: true, ticketTier: { select: { id: true, meetingQuota: true } } } },
      },
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

    const nextStatus = status ?? row.status;
    if (nextStatus === "PENDING" && (scheduledAt || location)) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR: a schedule needs a CONFIRMED request. Confirm it in the same call.",
        },
        { status: 400 }
      );
    }
    if (outcome && nextStatus !== "CONFIRMED") {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: an outcome needs a CONFIRMED request." },
        { status: 400 }
      );
    }
    if (scheduledAt && (scheduledAt < row.event.startDate || scheduledAt > row.event.endDate)) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: scheduledAt must fall inside the event dates." },
        { status: 400 }
      );
    }

    // Hosted-buyer quota: confirming a buyer appointment counts against the
    // requester's tier quota. Quota 0 means unlimited; no linked pass means
    // the organizer decides without a quota signal.
    if (status === "CONFIRMED" && row.status === "PENDING" && row.type === "BUYER_APPOINTMENT") {
      const quota = row.booking?.ticketTier.meetingQuota ?? 0;
      if (quota > 0) {
        const identity: Array<Record<string, unknown>> = [];
        if (row.requesterId) identity.push({ requesterId: row.requesterId });
        if (row.requesterEmail) identity.push({ requesterEmail: row.requesterEmail });
        const held = identity.length
          ? await db.meetingRequest.count({
              where: {
                eventId: row.eventId,
                type: "BUYER_APPOINTMENT",
                status: "CONFIRMED",
                id: { not: id },
                OR: identity,
              },
            })
          : 0;
        if (held >= quota) {
          return NextResponse.json(
            {
              success: false,
              error: `QUOTA_EXCEEDED: this pass allows ${quota} hosted-buyer meeting${quota === 1 ? "" : "s"} and ${held} are already confirmed.`,
            },
            { status: 409 }
          );
        }
      }
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (nextStatus === "DECLINED") {
      data.scheduledAt = null;
      data.location = "";
      data.outcome = "NONE";
      data.rating = null;
    } else {
      if (scheduledAt !== undefined) data.scheduledAt = scheduledAt;
      if (location !== null) data.location = location;
      if (outcome) data.outcome = outcome;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: nothing to update." },
        { status: 400 }
      );
    }

    const updated = await db.meetingRequest.update({
      where: { id },
      data,
    });

    await audit(request, {
      action: status ? `meeting.${status.toLowerCase()}` : "meeting.reschedule",
      entity: "MeetingRequest",
      entityId: id,
      metadata: {
        eventId: row.eventId,
        type: row.type,
        scheduledAt: updated.scheduledAt?.toISOString() ?? null,
        location: updated.location || null,
        outcome: updated.outcome,
      },
    });

    if (status) {
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
          scheduledAt: updated.scheduledAt ? formatSchedule(updated.scheduledAt) : undefined,
          location: updated.location || undefined,
        });
        await sendEmail({ to: row.requesterEmail, ...mail });
      } catch (mailError) {
        reportError("meetings-decision-email", mailError, { requestId: id });
      }
    } else if (updated.scheduledAt) {
      // Reschedule without a status change still notifies the requester:
      // a moved meeting they never hear about is a missed meeting.
      try {
        const mail = renderMeetingRequestRescheduled({
          type: row.type as MeetingRequestType,
          eventTitle: row.event.title,
          requesterName: row.requesterName,
          target: row.target,
          slot: row.slot,
          message: row.message,
          reference: row.id,
          scheduledAt: formatSchedule(updated.scheduledAt),
          location: updated.location || "",
        });
        await sendEmail({ to: row.requesterEmail, ...mail });
      } catch (mailError) {
        reportError("meetings-decision-email", mailError, { requestId: id });
      }
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
