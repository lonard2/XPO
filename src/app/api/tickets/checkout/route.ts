import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateTicketHash, generateSvgQrCode, type TicketPassPayload } from "@/lib/tickets/qrPass";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";
import { sendEmail } from "@/lib/email/transport";
import { renderBookingConfirmation } from "@/lib/email/templates";
import { formatDateRange, getTimeZoneForRegion } from "@/lib/i18n/formatters";
import { apiError } from "@/lib/api/envelope";
import { sha256hex } from "@/lib/auth/password";

const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_KEY_LENGTH = 128;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checkout body contract. Failure maps to the legacy per-field 400s so the
 * messages clients match on stay byte-for-byte identical.
 */
const CheckoutSchema = z.object({
  eventId: z.string().min(1),
  tierId: z.string().min(1),
  attendeeName: z.string().refine((v) => v.trim().length > 0, { message: "blank" }),
  attendeeEmail: z.string().refine((v) => EMAIL_RE.test(v.trim()), { message: "bad" }),
  quantity: z.unknown().optional(),
  userId: z.string().optional(),
  // Unknown locale types keep the historical fallback instead of failing:
  // the email language must never break a paid reservation.
  locale: z.unknown().optional(),
});

const FIELD_ERRORS: Record<string, string> = {
  eventId: "VALIDATION_ERROR: Missing or invalid eventId",
  tierId: "VALIDATION_ERROR: Missing or invalid tierId",
  attendeeName: "VALIDATION_ERROR: Missing or invalid attendeeName",
  attendeeEmail: "VALIDATION_ERROR: Missing or invalid attendeeEmail address",
};

export async function POST(request: Request) {
  const limited = await rateLimitResponse("tickets-checkout", request, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  type StoredBooking = {
    id: string;
    status: string;
    qrCodeHash: string;
    attendeeName: string;
    attendeeEmail: string;
    createdAt: Date;
    ticketTier: { id: string; name: string; price: number; currency: string };
    event: {
      id: string;
      title: string;
      slug: string;
      startDate: Date;
      endDate: Date;
      venue: { name: string; city: string } | null;
      venueHall: { name: string } | null;
    };
  };
  const bookingIncludes = {
    event: { include: { venue: true, venueHall: true, perks: true } },
    ticketTier: true,
  } as const;

  const bookingPayload = (
    booking: StoredBooking,
    signature: string,
    payloadString: string,
    svgQr: string
  ) => ({
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
  });

  type ReplayStored = {
    fingerprint: string;
    signature: string;
    payloadString: string;
    svgQr: string;
    booking: StoredBooking;
  };

  let idempotencyKey: string | null = null;
  let fingerprint = "";

  const replay = (stored: ReplayStored) => {
    if (stored.fingerprint !== fingerprint) {
      return apiError(
        "CONFLICT: this Idempotency-Key was already used for a different checkout.",
        409
      );
    }
    return NextResponse.json(
      bookingPayload(stored.booking, stored.signature, stored.payloadString, stored.svgQr),
      { status: 200, headers: { "Idempotent-Replayed": "true" } }
    );
  };

  try {
    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0];
      const message =
        typeof field === "string" && FIELD_ERRORS[field]
          ? FIELD_ERRORS[field]
          : "VALIDATION_ERROR: Missing or invalid request body";
      return apiError(message, 400);
    }
    const { eventId, tierId, attendeeName, attendeeEmail, userId } = parsed.data;

    // Quantity keeps its historical coercion (floor 1, no ceiling): the
    // conditional stock claim below is what enforces real capacity.
    const qty = Math.max(1, parseInt(String(parsed.data.quantity ?? 1), 10) || 1);
    const normalizedEmail = attendeeEmail.toLowerCase().trim();

    // Idempotency: a retried request with the same key returns the original
    // pass instead of booking again. Absent key means legacy behavior.
    const rawKey = request.headers.get("Idempotency-Key");
    idempotencyKey = rawKey?.trim() || null;
    if (idempotencyKey && idempotencyKey.length > MAX_KEY_LENGTH) {
      return apiError("VALIDATION_ERROR: Idempotency-Key is too long.", 400);
    }
    fingerprint = sha256hex(`${eventId}|${tierId}|${normalizedEmail}|${qty}`);

    if (idempotencyKey) {
      // Best-effort expiry sweep keeps the table bounded (mirrors sessions).
      await db.idempotencyKey.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
      const existing = await db.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
        include: { booking: { include: bookingIncludes } },
      });
      if (existing) return replay(existing as unknown as Parameters<typeof replay>[0]);
    }

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
      // The key row commits atomically with the booking: a concurrent retry
      // either blocks on the unique index or fails here, and the rollback
      // leaves no orphaned booking behind.
      if (idempotencyKey) {
        await tx.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            bookingId: created.id,
            fingerprint,
            signature,
            payloadString,
            svgQr,
            expiresAt: new Date(Date.now() + IDEMPOTENCY_WINDOW_MS),
          },
        });
      }
      return created;
    });

    try {
      const rawLocale = parsed.data.locale;
      const locale = typeof rawLocale === "string" && rawLocale ? rawLocale : "en";
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
      bookingPayload(booking, signature, payloadString, svgQr),
      { status: 201 }
    );
  } catch (error) {
    reportError("tickets-checkout", error);
    const guarded = error as Error & { status?: number; extra?: Record<string, unknown> };
    // Lost race on the idempotency key: the winner committed first, so the
    // original booking is now readable. Same fingerprint replays it.
    const prismaError = error as { code?: string; meta?: { target?: unknown } };
    if (
      idempotencyKey &&
      prismaError.code === "P2002" &&
      Array.isArray(prismaError.meta?.target) &&
      prismaError.meta.target.includes("key")
    ) {
      const winner = await db.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
        include: { booking: { include: bookingIncludes } },
      }).catch(() => null);
      if (winner) {
        return replay(winner as unknown as Parameters<typeof replay>[0]);
      }
    }
    if (guarded.status) {
      return apiError(guarded.message, guarded.status, { ...((guarded.extra || {})) });
    }
    return apiError(`INTERNAL_ERROR: ${(error as Error).message}`, 500);
  }
}
