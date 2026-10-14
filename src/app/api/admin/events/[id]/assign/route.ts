import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // RBAC Authorization Check
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch
      ? decodeURIComponent(roleMatch[1])
      : request.headers.get("x-xpo-user-role");

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only platform administrators can reassign event ownership.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { organizerId, organizerName } = body;

    if (!organizerId || typeof organizerId !== "string" || !organizerId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request: organizerId is required to reassign event ownership.",
        },
        { status: 400 }
      );
    }

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

    const targetOrganizer = await db.user.findUnique({
      where: { id: organizerId.trim() },
    });

    if (!targetOrganizer) {
      return NextResponse.json(
        {
          success: false,
          error: `Target organizer not found: No user matches ID "${organizerId}".`,
        },
        { status: 404 }
      );
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
    return NextResponse.json(
      {
        success: false,
        error: `Failed to reassign event ownership: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
