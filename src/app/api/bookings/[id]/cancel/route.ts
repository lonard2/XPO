import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { sendEmail } from "@/lib/email/transport";
import { renderBookingCancellation, renderWaitlistPromotion } from "@/lib/email/templates";
import { promoteWaitlist } from "@/lib/waitlist/promote";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/bookings/[id]/cancel — release a pass and its seat.
 *
 * The holder, the owning organizer, or an admin may cancel. A checked-in
 * pass cannot be cancelled; a cancelled pass is idempotent. The seat is
 * released in the same transaction as the status change.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true, organizerId: true } },
        ticketTier: { select: { id: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: booking does not exist." },
        { status: 404 }
      );
    }

    const isHolder = booking.userId === gate.caller.userId;
    const isOrganizer = canWriteEvent(gate.caller, booking.event.organizerId);
    if (!isHolder && !isOrganizer) {
      return NextResponse.json(
        { success: false, error: "Forbidden: only the pass holder or the owning organizer can cancel." },
        { status: 403 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ success: true, booking: { id, status: "CANCELLED" } });
    }
    if (booking.status === "CHECKED_IN") {
      return NextResponse.json(
        { success: false, error: "CONFLICT: a checked-in pass cannot be cancelled." },
        { status: 409 }
      );
    }

    await db.$transaction([
      db.booking.update({ where: { id }, data: { status: "CANCELLED" } }),
      db.ticketTier.updateMany({
        where: { id: booking.ticketTierId, soldCount: { gt: 0 } },
        data: { soldCount: { decrement: 1 } },
      }),
    ]);

    await audit(request, {
      action: "booking.cancel",
      entity: "Booking",
      entityId: id,
      metadata: { eventId: booking.eventId },
    });

    try {
      const mail = renderBookingCancellation({
        attendeeName: booking.attendeeName,
        eventTitle: booking.event.title,
        bookingId: booking.id,
      });
      await sendEmail({ to: booking.attendeeEmail, ...mail });
    } catch (mailError) {
      reportError("booking-cancel-email", mailError, { bookingId: id });
    }

    // A freed seat goes to the head of the waitlist. Mail failure never
    // undoes the promotion, which is already recorded.
    const promoted = await promoteWaitlist(booking.ticketTierId);
    if (promoted) {
      try {
        const mail = renderWaitlistPromotion({
          name: promoted.name,
          eventTitle: promoted.event.title,
          tierName: promoted.ticketTier.name,
          eventUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://xpo.events"}/en/events/${promoted.event.slug}`,
        });
        await sendEmail({ to: promoted.email, ...mail });
      } catch (mailError) {
        reportError("waitlist-promotion-email", mailError, {
          ticketTierId: booking.ticketTierId,
        });
      }
    }

    return NextResponse.json({ success: true, booking: { id, status: "CANCELLED" } });
  } catch (error) {
    reportError("booking-cancel", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not cancel the booking." },
      { status: 500 }
    );
  }
}
