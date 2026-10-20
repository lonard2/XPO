import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTicketHash } from "@/lib/tickets/qrPass";
import { resolveEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";
import { rateLimitResponse } from "@/lib/api/rateLimit";

export async function POST(request: Request) {
  const limited = rateLimitResponse("tickets-verify", request, { limit: 120, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json();
    const { qrCodeHash, payloadString, signature, autoCheckIn = true, supervisorOverride = false, eventId: scannedEventId } = body;

    // 1. Cryptographic Validation if signature & payload string provided
    if (payloadString && signature) {
      const cryptoResult = verifyTicketHash(payloadString, signature);
      if (!cryptoResult.valid) {
        return NextResponse.json(
          {
            valid: false,
            error: cryptoResult.error || "INVALID_SIGNATURE: Cryptographic pass verification failed",
          },
          { status: 400 }
        );
      }
    }

    if (!qrCodeHash && !payloadString) {
      return NextResponse.json(
        { valid: false, error: "VALIDATION_ERROR: Missing qrCodeHash or signed payload" },
        { status: 400 }
      );
    }

    // 2. Fetch booking record from DB
    let booking = null;
    if (qrCodeHash) {
      booking = await db.booking.findUnique({
        where: { qrCodeHash },
        include: {
          ticketTier: true,
          user: { select: { organization: true, avatarUrl: true } },
          event: {
            include: {
              venue: true,
              venueHall: true,
              perks: true,
            },
          },
        },
      });
    }

    if (!booking && payloadString) {
      try {
        const parsed = JSON.parse(payloadString);
        if (parsed.bookingId) {
          booking = await db.booking.findUnique({
            where: { id: parsed.bookingId },
            include: {
              ticketTier: true,
              user: { select: { organization: true, avatarUrl: true } },
              event: {
                include: {
                  venue: true,
                  venueHall: true,
                  perks: true,
                },
              },
            },
          });
        }
      } catch {
        // Handled below
      }
    }

    if (!booking) {
      return NextResponse.json(
        {
          valid: false,
          error: "TICKET_NOT_FOUND: Pass does not match any registered booking in database",
        },
        { status: 404 }
      );
    }

    // 2b. Gate scope guard: a scanner locked to one event must not admit
    // passes from another event's allocation.
    if (scannedEventId && scannedEventId !== booking.eventId) {
      return NextResponse.json(
        {
          valid: false,
          error: "EVENT_MISMATCH: Pass belongs to a different event than the scanning gate",
        },
        { status: 400 }
      );
    }

    // 3. Status Guard: Cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          valid: false,
          status: "CANCELLED",
          error: "TICKET_CANCELLED: Pass has been voided or cancelled by organizer",
        },
        { status: 400 }
      );
    }

    // 4. Double Scan Prevention (+ supervisor override re-admit).
    // An override re-stamps the admission timestamp through the same
    // ownership gate as check-in, so the server record matches the message.
    if (booking.status === "CHECKED_IN") {
      if (supervisorOverride) {
        const owner = await db.event.findUnique({
          where: { id: booking.eventId },
          select: { organizerId: true },
        });
        if (!owner || !canWriteEvent(await resolveEventCaller(request), owner.organizerId)) {
          return NextResponse.json(
            {
              valid: false,
              error: "FORBIDDEN: Only the owning organizer or a platform administrator can check in this pass.",
            },
            { status: 403 }
          );
        }
        const restamped = await db.booking.update({
          where: { id: booking.id },
          data: { checkedInAt: new Date() },
          include: {
            ticketTier: true,
            user: { select: { organization: true, avatarUrl: true } },
            event: { include: { venue: true, venueHall: true, perks: true } },
          },
        });
        const restampTier = restamped.ticketTier.name;
        const restampPerks = restamped.event.perks.filter(
          (p) =>
            !p.tierRequired ||
            restampTier.toLowerCase().includes(p.tierRequired.toLowerCase())
        );
        return NextResponse.json(
          {
            valid: true,
            alreadyCheckedIn: false,
            reEntryOverridden: true,
            status: restamped.status,
            checkedInAt: restamped.checkedInAt,
            message: "SUPERVISOR_OVERRIDE: Supervisor re-entry recorded and admission re-stamped",
            attendee: {
              name: restamped.attendeeName,
              email: restamped.attendeeEmail,
              company: restamped.user?.organization || null,
              photo: restamped.user?.avatarUrl || null,
            },
            ticketTier: { id: restamped.ticketTier.id, name: restamped.ticketTier.name },
            event: {
              id: restamped.event.id,
              title: restamped.event.title,
              venue: restamped.event.venue?.name,
              hall: restamped.event.venueHall?.name,
            },
            perks: restampPerks,
          },
          { status: 200 }
        );
      }
      const tierName = booking.ticketTier.name;
      const eligiblePerks = booking.event.perks.filter(
        (p) =>
          !p.tierRequired ||
          tierName.toLowerCase().includes(p.tierRequired.toLowerCase())
      );

      return NextResponse.json(
        {
          valid: true,
          alreadyCheckedIn: true,
          status: "CHECKED_IN",
          checkedInAt: booking.checkedInAt,
          message: "DOUBLE_SCAN: Ticket has already been validated and checked in",
          attendee: {
            name: booking.attendeeName,
            email: booking.attendeeEmail,
            company: booking.user?.organization || null,
            photo: booking.user?.avatarUrl || null,
          },
          ticketTier: {
            id: booking.ticketTier.id,
            name: booking.ticketTier.name,
          },
          event: {
            id: booking.event.id,
            title: booking.event.title,
            venue: booking.event.venue?.name,
            hall: booking.event.venueHall?.name,
          },
          perks: eligiblePerks,
        },
        { status: 200 }
      );
    }

    // 5. Check-In Transition (verification above stays open to all readers;
    // only the owning organizer or an admin may mutate check-in state)
    let updatedBooking = booking;
    if (autoCheckIn) {
      const owner = await db.event.findUnique({
        where: { id: booking.eventId },
        select: { organizerId: true },
      });
      if (!owner || !canWriteEvent(await resolveEventCaller(request), owner.organizerId)) {
        return NextResponse.json(
          {
            valid: false,
            error: "FORBIDDEN: Only the owning organizer or a platform administrator can check in this pass.",
          },
          { status: 403 }
        );
      }
      updatedBooking = await db.booking.update({
        where: { id: booking.id },
        data: {
          status: "CHECKED_IN",
          checkedInAt: new Date(),
        },
        include: {
          ticketTier: true,
          user: { select: { organization: true, avatarUrl: true } },
          event: {
            include: {
              venue: true,
              venueHall: true,
              perks: true,
            },
          },
        },
      });
    }

    const tierName = updatedBooking.ticketTier.name;
    const eligiblePerks = updatedBooking.event.perks.filter(
      (p) =>
        !p.tierRequired ||
        tierName.toLowerCase().includes(p.tierRequired.toLowerCase())
    );

    return NextResponse.json(
      {
        valid: true,
        alreadyCheckedIn: false,
        status: updatedBooking.status,
        checkedInAt: updatedBooking.checkedInAt,
        message: "DOOR_ENTRY_GRANTED: Attendee verified and pass marked as checked in",
        attendee: {
          name: updatedBooking.attendeeName,
          email: updatedBooking.attendeeEmail,
          company: updatedBooking.user?.organization || null,
          photo: updatedBooking.user?.avatarUrl || null,
        },
        ticketTier: {
          id: updatedBooking.ticketTier.id,
          name: updatedBooking.ticketTier.name,
        },
        event: {
          id: updatedBooking.event.id,
          title: updatedBooking.event.title,
          venue: updatedBooking.event.venue?.name,
          hall: updatedBooking.event.venueHall?.name,
        },
        perks: eligiblePerks,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `INTERNAL_ERROR: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qrCodeHash = searchParams.get("qrCodeHash");
    const bookingId = searchParams.get("bookingId");

    if (!qrCodeHash && !bookingId) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR: Missing qrCodeHash or bookingId query param" },
        { status: 400 }
      );
    }

    const booking = await db.booking.findFirst({
      where: qrCodeHash ? { qrCodeHash } : { id: bookingId! },
      include: {
        ticketTier: true,
        event: {
          include: {
            venue: true,
            venueHall: true,
            perks: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { valid: false, error: "TICKET_NOT_FOUND: No booking found" },
        { status: 404 }
      );
    }

    const eligiblePerks = booking.event.perks.filter(
      (p) =>
        !p.tierRequired ||
        booking.ticketTier.name.toLowerCase().includes(p.tierRequired.toLowerCase())
    );

    return NextResponse.json({
      valid: true,
      status: booking.status,
      checkedInAt: booking.checkedInAt,
      attendee: {
        name: booking.attendeeName,
        email: booking.attendeeEmail,
      },
      ticketTier: {
        id: booking.ticketTier.id,
        name: booking.ticketTier.name,
        price: booking.ticketTier.price,
        currency: booking.ticketTier.currency,
      },
      event: {
        id: booking.event.id,
        title: booking.event.title,
        startDate: booking.event.startDate,
        endDate: booking.event.endDate,
        venue: booking.event.venue?.name,
        hall: booking.event.venueHall?.name,
      },
      perks: eligiblePerks,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `INTERNAL_ERROR: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
