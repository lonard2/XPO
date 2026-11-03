import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

/**
 * GET /api/meetings/requests — meeting and RFQ requests for the caller.
 *
 * Organizers see requests for events they own; admins see the platform.
 * Public submissions arrive through POST /api/meetings/request.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase();
    const eventId = searchParams.get("eventId") || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (gate.caller.role !== "ADMIN") {
      where.event = { organizerId: gate.caller.userId };
    }

    const [requests, total, pending] = await db.$transaction([
      db.meetingRequest.findMany({
        where,
        include: { event: { select: { id: true, title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.meetingRequest.count({ where }),
      db.meetingRequest.count({ where: { ...where, status: "PENDING" } }),
    ]);

    return NextResponse.json({ success: true, requests, total, pending });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load meeting requests." },
      { status: 500 }
    );
  }
}
