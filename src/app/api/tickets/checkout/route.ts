import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTicketHash, generateSvgQrCode, type TicketPassPayload } from "@/lib/tickets/qrPass";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";
import { sendEmail } from "@/lib/email/transport";
import { renderBookingConfirmation } from "@/lib/email/templates";
import { formatDateRange, getTimeZoneForRegion } from "@/lib/i18n/formatters";
import { apiError } from "@/lib/api/envelope";

export async function POST(request: Request) {
  const limited = await rateLimitResponse("tickets-checkout", request, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json();
    const { eventId, tierId, attendeeName, attendeeEmail, quantity = 1, userId } = body;

    // 1. Validation
    if (!eventId || typeof eventId !== "string") {
      return apiError("VALIDATION_ERROR: Missing or invalid eventId", 400);
    }
    if (!tierId || typeof tierId !== "string") {
      return apiError("VALIDATION_ERROR: Missing or invalid tierId", 400);
    }
    if (!attendeeName || typeof attendeeName !== "string" || attendeeName.trim().length === 0) {
      return apiError("VALIDATION_ERROR: Missing or invalid attendeeName", 400);
    }
    if (
      !attendeeEmail ||
      typeof attendeeEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail.trim())
    ) {
      return apiError("VALIDATION_ERROR: Missing or invalid attendeeEmail address", 400);
    }

    const qty = Math.max(1, parseInt(String(quantity), 10) || 1);
    const normalizedEmail = attendeeEmail.toLowerCase().trim();

    // Guarded failure helper: thrown inside the transaction, mapped below.
    const fail = (status: number, error: string, extra?: Record<string, unknown>): never => {
      const err = new Error(error) as Error & { status?: number; extra?: Record<string, unknown> };
      err.status = status;
      err.extra = extra;
      throw err;
    };

    // Cryptographic pass material (pure: generated before the transaction).
    const bookingId = `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const payload: TicketPassPayload = {
      bookingId,
      eventId,
      tierId,
      attendeeEmail: normalizedEmail,
      issuedAt: Date.now(),
      nonce: `nonce-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };
    const { qrCodeHash, signature, payloadString } = generateTicketHash(payload);
    const svgQr = generateSvgQrCode(qrCodeHash, { primaryColor: "#1e3a8a", size: 300 });

    // Atomic reservation: fresh capacity read, user resolve, booking
    // create, and guarded stock claim in one transaction. The conditional
    // increment (not the pre-check) prevents oversell: concurrent bursts
    // each claim only genuinely remaining stock.
    const booking = await db.$transaction(async (tx) => {
      const fresh = await tx.ticketTier.findUnique({
        where: { id: tierId },
        include: {
          event: { include: { venue: true, venueHall: true, perks: true } },
        },
      });
      if (!fresh || fresh.eventId !== eventId) {
        fail(404, "NOT_FOUND: Ticket tier not found for this event");
      }
      const tier = fresh as NonNullable<typeof fresh>;

      let user = null;
      if (userId) {
        user = await tx.user.findUnique({ where: { id: userId } });
      }
      if (!user) {
        user = await tx.user.findUnique({ where: { email: normalizedEmail } });
      }
      if (!user) {
        user = await tx.user.create({
          data: { email: normalizedEmail, name: attendeeName.trim(), role: "ATTENDEE" },
        });
      }

      const created = await tx.booking.create({
        data: {
          id: bookingId,
          userId: user.id,
          eventId: tier.eventId,
          ticketTierId: tier.id,
          attendeeName: attendeeName.trim(),
          attendeeEmail: normalizedEmail,
          status: "CONFIRMED",
          qrCodeHash,
        },
        include: {
          event: { include: { venue: true, venueHall: true, perks: true } },
          ticketTier: true,
        },
      });

      const claimed = await tx.ticketTier.updateMany({
        where: { id: tier.id, soldCount: { lte: tier.capacity - qty } },
        data: { soldCount: { increment: qty } },
      });
      if (claimed.count === 0) {
        const current = await tx.ticketTier.findUnique({ where: { id: tier.id } });
        const remaining = Math.max(0, (current?.capacity || 0) - (current?.soldCount || 0));
        fail(400, "CAPACITY_EXCEEDED: Ticket tier is sold out or requested quantity exceeds remaining capacity", { remaining });
      }
      return created;
    });

    try {
      const locale = typeof body.locale === "string" && body.locale ? body.locale : "en";
      const timezone = getTimeZoneForRegion(booking.event.regionId || "id");
      const venueText = [booking.event.venue?.name, booking.event.venueHall?.name]
        .filter(Boolean)
        .join(", ") || "Venue to be announced";
      const mail = renderBookingConfirmation({
        attendeeName: booking.attendeeName,
        eventTitle: booking.event.title,
        datesText: formatDateRange(
          booking.event.startDate,
          booking.event.endDate,
          locale,
          timezone
        ),
        venueText,
        tierName: booking.ticketTier.name,
        bookingId: booking.id,
        passUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://xpo.events"}/${locale}/my-tickets/${booking.id}`,
      });
      await sendEmail({ to: booking.attendeeEmail, ...mail });
    } catch (mailError) {
      // A committed booking must not fail because mail is down.
      reportError("tickets-checkout-email", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ticket pass reservation confirmed successfully",
        booking: {
          id: booking.id,
          status: booking.status,
          qrCodeHash: booking.qrCodeHash,
          signature,
          payloadString,
          svgQr,
          attendeeName: booking.attendeeName,
          attendeeEmail: booking.attendeeEmail,
          createdAt: booking.createdAt,
          ticketTier: {
            id: booking.ticketTier.id,
            name: booking.ticketTier.name,
            price: booking.ticketTier.price,
            currency: booking.ticketTier.currency,
          },
          event: {
            id: booking.event.id,
            title: booking.event.title,
            slug: booking.event.slug,
            startDate: booking.event.startDate,
            endDate: booking.event.endDate,
            venue: {
              name: booking.event.venue?.name,
              city: booking.event.venue?.city,
              hallName: booking.event.venueHall?.name,
            },
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    reportError("tickets-checkout", error);
    const guarded = error as Error & { status?: number; extra?: Record<string, unknown> };
    if (guarded.status) {
      return apiError(guarded.message, guarded.status, { ...((guarded.extra || {})) });
    }
    return apiError(`INTERNAL_ERROR: ${(error as Error).message}`, 500);
  }
}
