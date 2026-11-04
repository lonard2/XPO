import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/bookings/[id]/agenda — save or remove a session on a pass.
 *
 * The bookmark is tied to the booking, so it follows the delegate across
 * devices instead of living in one browser's local storage. Only the holder
 * or an admin may change it, and the session must belong to the same event.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const agendaItemId = typeof body.agendaItemId === "string" ? body.agendaItemId : "";
    const saved = body.saved === true;

    if (!agendaItemId) {
      return apiError("VALIDATION_ERROR: agendaItemId is required.", 400);
    }

    const booking = await db.booking.findUnique({
      where: { id },
      select: { id: true, userId: true, eventId: true, status: true },
    });
    if (!booking) {
      return apiError("NOT_FOUND: booking does not exist.", 404);
    }
    if (booking.userId !== gate.caller.userId && gate.caller.role !== "ADMIN") {
      return apiError("Forbidden: only the pass holder can change this agenda.", 403);
    }
    if (booking.status === "CANCELLED") {
      return apiError("CONFLICT: a cancelled pass has no agenda.", 409);
    }

    const item = await db.agendaItem.findUnique({
      where: { id: agendaItemId },
      select: { eventId: true },
    });
    if (!item || item.eventId !== booking.eventId) {
      return apiError("NOT_FOUND: session does not belong to this event.", 404);
    }

    if (saved) {
      await db.agendaBookmark.upsert({
        where: { bookingId_agendaItemId: { bookingId: id, agendaItemId } },
        create: { bookingId: id, agendaItemId },
        update: {},
      });
    } else {
      await db.agendaBookmark.deleteMany({ where: { bookingId: id, agendaItemId } });
    }

    return NextResponse.json({ success: true, saved });
  } catch {
    return apiError("INTERNAL_ERROR: could not update the agenda.", 500);
  }
}
