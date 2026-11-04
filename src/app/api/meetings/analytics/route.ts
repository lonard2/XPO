import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { reportError } from "@/lib/observability/logger";

/**
 * GET /api/meetings/analytics — booked-vs-held-vs-rated funnel for the
 * hosted-buyer program. Optional `eventId` narrows to one event; without it
 * the scope is the organizer's events (or the platform for admins), matching
 * the meeting inbox.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId") || undefined;

    if (eventId) {
      const event = await db.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
        select: { id: true, organizerId: true },
      });
      if (!event) {
        return NextResponse.json(
          { success: false, error: "NOT_FOUND: event does not exist." },
          { status: 404 }
        );
      }
      if (gate.caller.role !== "ADMIN" && event.organizerId !== gate.caller.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: only the owning organizer can read this analytics." },
          { status: 403 }
        );
      }
    }

    const scope: Record<string, unknown> =
      gate.caller.role === "ADMIN"
        ? {}
        : { event: { organizerId: gate.caller.userId } };
    const where: Record<string, unknown> = { ...scope };
    if (eventId) where.eventId = eventId;

    const [byStatus, held, noShow, rated] = await Promise.all([
      db.meetingRequest.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
      }),
      db.meetingRequest.count({ where: { ...where, outcome: "HELD" } }),
      db.meetingRequest.count({ where: { ...where, outcome: "NO_SHOW" } }),
      db.meetingRequest.aggregate({
        where: { ...where, rating: { not: null } },
        _count: { rating: true },
        _avg: { rating: true },
      }),
    ]);

    const counts: Record<string, number> = {};
    for (const row of byStatus) counts[row.status] = row._count.status;
    const requested = Object.values(counts).reduce((sum, n) => sum + n, 0);

    // Per-tier quota usage: confirmed buyer appointments attributed through
    // the linked pass. Unlinked requests cannot name a tier and are reported
    // separately instead of being guessed at.
    const tiers = await db.ticketTier.findMany({
      where: eventId
        ? { eventId }
        : gate.caller.role === "ADMIN"
          ? {}
          : { event: { organizerId: gate.caller.userId } },
      select: { id: true, name: true, meetingQuota: true, eventId: true },
      orderBy: { name: "asc" },
    });
    const confirmedBuyer = await db.meetingRequest.findMany({
      where: { ...where, type: "BUYER_APPOINTMENT", status: "CONFIRMED" },
      select: { booking: { select: { ticketTierId: true } } },
    });
    const usedByTier = new Map<string, number>();
    let unlinked = 0;
    for (const row of confirmedBuyer) {
      if (row.booking) {
        usedByTier.set(
          row.booking.ticketTierId,
          (usedByTier.get(row.booking.ticketTierId) ?? 0) + 1
        );
      } else {
        unlinked += 1;
      }
    }

    return NextResponse.json({
      success: true,
      analytics: {
        requested,
        pending: counts.PENDING ?? 0,
        confirmed: counts.CONFIRMED ?? 0,
        declined: counts.DECLINED ?? 0,
        held,
        noShow: noShow,
        awaitingOutcome: (counts.CONFIRMED ?? 0) - held - noShow,
        ratedCount: rated._count.rating,
        avgRating:
          rated._avg.rating === null ? null : Math.round(rated._avg.rating * 10) / 10,
        tiers: tiers.map((tier) => ({
          tierId: tier.id,
          name: tier.name,
          quota: tier.meetingQuota,
          confirmed: usedByTier.get(tier.id) ?? 0,
        })),
        unlinkedConfirmed: unlinked,
      },
    });
  } catch (error) {
    reportError("meetings-analytics", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not load meeting analytics." },
      { status: 500 }
    );
  }
}
