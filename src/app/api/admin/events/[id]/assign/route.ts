import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // RBAC Authorization Check
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { organizerId, organizerName } = body;

    if (!organizerId || typeof organizerId !== "string" || !organizerId.trim()) {
      return apiError("Bad Request: organizerId is required to reassign event ownership.", 400);
    }

    const event = await db.event.findFirst({
      where: {
        ...idOrSlugWhere(id),
      },
    });

    if (!event) {
      return apiError(`Event not found: No event matches identifier "${id}".`, 404);
    }

    const targetOrganizer = await db.user.findUnique({
      where: { id: organizerId.trim() },
    });

    if (!targetOrganizer) {
      return apiError(`Target organizer not found: No user matches ID "${organizerId}".`, 404);
    }

    const assignedName =
      (organizerName && typeof organizerName === "string" && organizerName.trim()) ||
      targetOrganizer.organization ||
      targetOrganizer.name;

    const updatedEvent = await db.event.update({
      where: { id: event.id },
      data: {
        organizerId: targetOrganizer.id,
        isPlatformCurated: false,
        organizerName: assignedName,
      },
      include: {
        organizer: true,
        venue: true,
        venueHall: true,
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: `Event "${updatedEvent.title}" successfully transferred to organizer "${assignedName}".`,
    });
  } catch (error) {
    return apiError(`Failed to reassign event ownership: ${(error as Error).message}`, 500);
  }
}
