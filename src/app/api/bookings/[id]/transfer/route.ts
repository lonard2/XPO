import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { sendEmail } from "@/lib/email/transport";
import { renderBookingTransfer } from "@/lib/email/templates";
import { apiError } from "@/lib/api/envelope";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/bookings/[id]/transfer — move a pass to another holder.
 *
 * Only the holder or an admin may transfer. The QR hash stays the same, so
 * the pass that is already in the wallet keeps working; the holder fields
 * on the booking are what the gate and the wallet read.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const attendeeName = typeof body.attendeeName === "string" ? body.attendeeName.trim().slice(0, MAX_NAME) : "";
    const attendeeEmail =
      typeof body.attendeeEmail === "string" ? body.attendeeEmail.toLowerCase().trim() : "";
    const locale = typeof body.locale === "string" && body.locale ? body.locale : "en";

    if (!attendeeName) {
      return apiError("VALIDATION_ERROR: attendeeName is required.", 400);
    }
    if (!EMAIL_RE.test(attendeeEmail)) {
      return apiError("VALIDATION_ERROR: a valid attendeeEmail is required.", 400);
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { event: { select: { id: true, title: true } } },
    });
    if (!booking) {
      return apiError("NOT_FOUND: booking does not exist.", 404);
    }

    const isHolder = booking.userId === gate.caller.userId;
    const isAdmin = gate.caller.role === "ADMIN";
    if (!isHolder && !isAdmin) {
      return apiError("Forbidden: only the pass holder can transfer this pass.", 403);
    }
    if (booking.status === "CANCELLED") {
      return apiError("CONFLICT: a cancelled pass cannot be transferred.", 409);
    }
    if (booking.status === "CHECKED_IN") {
      return apiError("CONFLICT: a checked-in pass cannot be transferred.", 409);
    }

    const updated = await db.booking.update({
      where: { id },
      data: { attendeeName, attendeeEmail },
    });

    await audit(request, {
      action: "booking.transfer",
      entity: "Booking",
      entityId: id,
      metadata: { eventId: booking.eventId, to: attendeeEmail },
    });

    try {
      const mail = renderBookingTransfer({
        attendeeName,
        eventTitle: booking.event.title,
        bookingId: booking.id,
        passUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://xpo.events"}/${locale}/my-tickets/${booking.id}`,
      });
      await sendEmail({ to: attendeeEmail, ...mail });
    } catch (mailError) {
      reportError("booking-transfer-email", mailError, { bookingId: id });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updated.id,
        status: updated.status,
        attendeeName: updated.attendeeName,
        attendeeEmail: updated.attendeeEmail,
      },
    });
  } catch (error) {
    reportError("booking-transfer", error);
    return apiError("INTERNAL_ERROR: could not transfer the booking.", 500);
  }
}
