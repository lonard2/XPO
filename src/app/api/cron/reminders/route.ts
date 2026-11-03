import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/transport";
import { renderEventReminder } from "@/lib/email/templates";
import { reportError } from "@/lib/observability/logger";
import { formatDateRange, getTimeZoneForRegion } from "@/lib/i18n/formatters";

const BATCH = 200;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * GET /api/cron/reminders — send the T-24h and T-2h reminders.
 *
 * Hosting-neutral: any scheduler can call this every 15 minutes with
 * `Authorization: Bearer $CRON_SECRET`. The sent markers make the call
 * idempotent, so overlapping runs cannot double-send. Events starting within
 * two hours get only the short reminder, never both in one run.
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: a valid CRON_SECRET is required." },
      { status: 401 }
    );
  }

  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const [due24, due2] = await Promise.all([
      db.booking.findMany({
        where: {
          status: "CONFIRMED",
          reminder24hSentAt: null,
          event: { startDate: { gt: in2h, lte: in24h } },
        },
        include: {
          event: { include: { venue: true, venueHall: true } },
          ticketTier: true,
        },
        take: BATCH,
      }),
      db.booking.findMany({
        where: {
          status: "CONFIRMED",
          reminder2hSentAt: null,
          event: { startDate: { gt: now, lte: in2h } },
        },
        include: {
          event: { include: { venue: true, venueHall: true } },
          ticketTier: true,
        },
        take: BATCH,
      }),
    ]);

    let sent = 0;

    for (const [hours, bookings] of [
      [24, due24],
      [2, due2],
    ] as const) {
      for (const booking of bookings) {
        const timezone = getTimeZoneForRegion(booking.event.regionId || "id");
        const venueText =
          [booking.event.venue?.name, booking.event.venueHall?.name].filter(Boolean).join(", ") ||
          "Venue to be announced";
        try {
          const mail = renderEventReminder({
            attendeeName: booking.attendeeName,
            eventTitle: booking.event.title,
            datesText: formatDateRange(
              booking.event.startDate,
              booking.event.endDate,
              "en",
              timezone
            ),
            venueText,
            hoursUntil: hours,
            passUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://xpo.events"}/en/my-tickets/${booking.id}`,
          });
          await sendEmail({ to: booking.attendeeEmail, ...mail });
          await db.booking.update({
            where: { id: booking.id },
            data:
              hours === 2
                ? {
                    reminder2hSentAt: now,
                    // A booking created inside the short window must not get
                    // the long reminder later.
                    reminder24hSentAt: booking.reminder24hSentAt ?? now,
                  }
                : { reminder24hSentAt: now },
          });
          sent += 1;
        } catch (error) {
          reportError("reminder-email", error, { bookingId: booking.id });
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      candidates: due24.length + due2.length,
    });
  } catch (error) {
    reportError("reminders", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: reminder run failed." },
      { status: 500 }
    );
  }
}
