import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const venueId = typeof body?.venueId === "string" ? body.venueId.trim() : "";
    const rawHallIds: unknown[] = Array.isArray(body?.venueHallIds)
      ? body.venueHallIds
      : [];
    const requestedHallIds: string[] = [
      ...new Set(
        rawHallIds.filter(
          (hallId): hallId is string =>
            typeof hallId === "string" && hallId.trim().length > 0
        )
      ),
    ];

    const existing = await db.event.findFirst({
      where: idOrSlugWhere(id),
      select: { id: true, venueId: true, regionId: true, organizerId: true },
    });
    if (!existing) {
      return apiError(`Event not found for ID: ${id}`, 404);
    }

    const caller = await resolveEventCaller(request);
    if (!canWriteEvent(caller, existing.organizerId)) {
      return apiError(
        "Forbidden: Only the owning organizer or a platform administrator can reassign this event's venue.",
        403
      );
    }

    if (!venueId) {
      return apiError("Bad Request: venueId is required.", 400);
    }

    const venue = await db.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        regionId: true,
        halls: { select: { id: true } },
      },
    });
    if (!venue) {
      return apiError("Bad Request: venue not found.", 400);
    }

    const validHallIds = new Set(venue.halls.map((hall) => hall.id));
    const allocated = requestedHallIds.filter((hallId) => validHallIds.has(hallId));
    if (allocated.length === 0) {
      return apiError(
        "Bad Request: at least one space from the selected venue is required.",
        400
      );
    }

    const updated = await db.event.update({
      where: { id: existing.id },
      data: {
        venueId: venue.id,
        regionId: venue.regionId,
        venueHallId: allocated[0],
        venueHallIds: JSON.stringify(allocated),
      },
      include: {
        venue: { include: { halls: true } },
        venueHall: true,
      },
    });

    await audit(request, {
      action: "event.venue",
      entity: "event",
      entityId: updated.id,
      metadata: {
        fromVenueId: existing.venueId,
        toVenueId: venue.id,
        fromRegionId: existing.regionId,
        toRegionId: venue.regionId,
        allocated,
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return apiError(`Failed to reassign venue: ${(error as Error).message}`, 500);
  }
}
