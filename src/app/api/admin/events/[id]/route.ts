import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/observability/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/events/[id] — permanently removes an event and its
 * dependent records. ADMIN only. Bookings are deleted explicitly (the Booking
 * relation has no database cascade); ticket tiers, booths, agenda items,
 * perks, and AI reports cascade from the event delete.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // RBAC Authorization Check (same convention as assign/release endpoints)
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch
      ? decodeURIComponent(roleMatch[1])
      : request.headers.get("x-xpo-user-role");

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only platform administrators can delete events.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const event = await db.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, title: true },
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

    // Bookings first: no cascade on Booking.event.
    await db.booking.deleteMany({ where: { eventId: event.id } });
    await db.event.delete({ where: { id: event.id } });

    await audit(request, { action: "event.delete", entity: "event", entityId: event.id, metadata: { title: event.title } });
    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" and its bookings deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete event: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
