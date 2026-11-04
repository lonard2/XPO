import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { resolveEventCaller } from "@/lib/auth/eventOwnership";
import { reportError } from "@/lib/observability/logger";
import { audit } from "@/lib/observability/audit";
import { sendEmail } from "@/lib/email/transport";
import {
  renderMeetingRequestConfirmation,
  renderMeetingRequestNotification,
  type MeetingRequestType,
} from "@/lib/email/templates";

const TYPES: MeetingRequestType[] = ["RFQ", "DEAL_SLOT", "BUYER_APPOINTMENT", "BILATERAL_SLOT", "DEAL_ROOM"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_TARGET = 200;
const MAX_SLOT = 200;
const MAX_MESSAGE = 2000;

/**
 * POST /api/meetings/request — persist a meeting/RFQ request and notify both
 * sides. Public by design: delegates without accounts submit these from event
 * pages. Rate-limited per IP; the organizer notification failing never fails
 * the stored request.
 */
export async function POST(request: Request) {
  const limited = await rateLimitResponse("meetings-request", request, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const eventId = typeof body.eventId === "string" ? body.eventId : "";
    const type = typeof body.type === "string" ? body.type.toUpperCase() : "";
    const requesterName = typeof body.requesterName === "string" ? body.requesterName.trim().slice(0, MAX_NAME) : "";
    const requesterEmail =
      typeof body.requesterEmail === "string" ? body.requesterEmail.toLowerCase().trim() : "";
    const target = typeof body.target === "string" ? body.target.trim().slice(0, MAX_TARGET) : "";
    const slot = typeof body.slot === "string" ? body.slot.trim().slice(0, MAX_SLOT) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
    const boothId = typeof body.boothId === "string" && body.boothId ? body.boothId : null;

    if (!eventId) {
      return NextResponse.json({ error: "VALIDATION_ERROR: eventId is required." }, { status: 400 });
    }
    if (!(TYPES as string[]).includes(type)) {
      return NextResponse.json(
        { error: `VALIDATION_ERROR: type must be one of ${TYPES.join(", ")}.` },
        { status: 400 }
      );
    }
    if (!requesterName) {
      return NextResponse.json({ error: "VALIDATION_ERROR: requesterName is required." }, { status: 400 });
    }
    if (!EMAIL_RE.test(requesterEmail)) {
      return NextResponse.json({ error: "VALIDATION_ERROR: a valid requesterEmail is required." }, { status: 400 });
    }

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { organizer: { select: { email: true, name: true } } },
    });
    if (!event) {
      return NextResponse.json({ error: "NOT_FOUND: event does not exist." }, { status: 404 });
    }

    if (boothId) {
      const booth = await db.boothTenant.findFirst({
        where: { id: boothId, eventId },
        select: { id: true },
      });
      if (!booth) {
        return NextResponse.json(
          { error: "NOT_FOUND: booth does not belong to this event." },
          { status: 404 }
        );
      }
    }

    // Shared identity, best-effort: a signed-in requester is linked, plus
    // their pass when exactly one confirmed booking exists for the event.
    // Several passes means ambiguity, so nothing is linked rather than the
    // wrong pass.
    const caller = await resolveEventCaller(request);
    const requesterId = caller.userId;
    let bookingId: string | null = null;
    if (requesterId) {
      const passes = await db.booking.findMany({
        where: {
          userId: requesterId,
          eventId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
        },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (passes.length === 1) bookingId = passes[0].id;
    }

    const created = await db.meetingRequest.create({
      data: {
        eventId,
        type,
        requesterName,
        requesterEmail,
        target,
        slot,
        message,
        requesterId,
        bookingId,
        boothId,
      },
    });

    await audit(request, {
      action: "meeting.request",
      entity: "MeetingRequest",
      entityId: created.id,
      metadata: { eventId, type, target, requesterId, bookingId, boothId },
    });

    const mailInput = {
      type: type as MeetingRequestType,
      eventTitle: event.title,
      requesterName,
      target,
      slot,
      message,
      reference: created.id,
    };

    try {
      const confirmation = renderMeetingRequestConfirmation(mailInput);
      await sendEmail({ to: requesterEmail, ...confirmation });
    } catch (mailError) {
      reportError("meetings-request-email", mailError, { requestId: created.id });
    }

    const organizerEmail = event.organizer?.email;
    if (organizerEmail) {
      try {
        const notification = renderMeetingRequestNotification({ ...mailInput, requesterEmail });
        await sendEmail({ to: organizerEmail, ...notification });
      } catch (mailError) {
        reportError("meetings-request-email", mailError, { requestId: created.id });
      }
    }

    return NextResponse.json(
      { success: true, requestId: created.id, status: created.status },
      { status: 201 }
    );
  } catch (error) {
    reportError("meetings-request", error);
    return NextResponse.json({ error: "INTERNAL_ERROR: could not record the request." }, { status: 500 });
  }
}
