import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/events/[id]/release — reverse of `assign`: returns an event
 * to platform curation (organizerId null, isPlatformCurated true), removing it
 * from every organizer portal. ADMIN only.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // RBAC Authorization Check (same convention as the assign endpoint)
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch
      ? decodeURIComponent(roleMatch[1])
      : request.headers.get("x-xpo-user-role");

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only platform administrators can release events to platform curation.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const event = await db.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: `Event not found: No event matches identifier "${id}".`,
        },
        { status: 404 }
      );
    }

    const updatedEvent = await db.event.update({
      where: { id: event.id },
      data: {
        organizerId: null,
        isPlatformCurated: true,
        organizerName: "XPO Platform Administration",
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
      message: `Event "${updatedEvent.title}" released to platform curation.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to release event: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
