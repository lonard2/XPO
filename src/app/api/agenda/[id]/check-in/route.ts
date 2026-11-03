import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/agenda/[id]/check-in — record a delegate at one session.
 *
 * Reuses the pass QR hash, so the same badge scanned at the gate also marks
 * session attendance. Only the owning organizer or an admin may scan, the
 * booking must belong to the same event, and repeats are idempotent.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const qrCodeHash = typeof body.qrCodeHash === "string" ? body.qrCodeHash.trim() : "";

    if (!qrCodeHash) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: qrCodeHash is required." },
        { status: 400 }
      );
    }

    const session = await db.agendaItem.findUnique({
      where: { id },
      include: { event: { select: { id: true, organizerId: true, title: true } } },
    });
    if (!session) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: session does not exist." },
        { status: 404 }
      );
    }
    if (!canWriteEvent(gate.caller, session.event.organizerId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: only the owning organizer can check in this session." },
        { status: 403 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { qrCodeHash },
      select: {
        id: true,
        eventId: true,
        attendeeName: true,
        attendeeEmail: true,
        status: true,
      },
    });
    if (!booking || booking.eventId !== session.eventId) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: pass does not belong to this event." },
        { status: 404 }
      );
    }
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "CONFLICT: a cancelled pass cannot check in." },
        { status: 409 }
      );
    }

    const existing = await db.sessionCheckIn.findUnique({
      where: { bookingId_agendaItemId: { bookingId: booking.id, agendaItemId: session.id } },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        checkedInAt: existing.checkedInAt,
        attendee: { name: booking.attendeeName, email: booking.attendeeEmail },
        session: { id: session.id, title: session.title },
      });
    }

    const created = await db.sessionCheckIn.create({
      data: { bookingId: booking.id, agendaItemId: session.id },
    });

    await audit(request, {
      action: "session.checkin",
      entity: "SessionCheckIn",
      entityId: created.id,
      metadata: { eventId: session.eventId, agendaItemId: session.id },
    });

    return NextResponse.json(
      {
        success: true,
        alreadyCheckedIn: false,
        checkedInAt: created.checkedInAt,
        attendee: { name: booking.attendeeName, email: booking.attendeeEmail },
        session: { id: session.id, title: session.title },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not record the session check-in." },
      { status: 500 }
    );
  }
}
