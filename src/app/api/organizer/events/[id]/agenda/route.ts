import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/organizer/events/[id]/agenda — sessions for the scanner's session
 * check-in selector. Scoped to the owning organizer or an admin.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const event = await db.event.findFirst({
      where: { ...idOrSlugWhere(id) },
      select: { id: true, organizerId: true },
    });
    if (!event) {
      return apiError("NOT_FOUND: event does not exist.", 404);
    }
    if (!canWriteEvent(gate.caller, event.organizerId)) {
      return apiError("Forbidden: only the owning organizer can read this agenda.", 403);
    }

    const sessions = await db.agendaItem.findMany({
      where: { eventId: event.id },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        title: true,
        location: true,
        startTime: true,
        endTime: true,
        track: true,
      },
    });

    return NextResponse.json({ success: true, sessions });
  } catch {
    return apiError("INTERNAL_ERROR: could not load the agenda.", 500);
  }
}
