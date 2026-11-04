import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

/**
 * GET /api/meetings/requests — meeting and RFQ requests for the caller.
 *
 * Organizers see requests for events they own; admins see the platform.
 * Attendees see only their own requests, matched by account or by the email
 * they submitted with. Public submissions arrive through POST
 * /api/meetings/request.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase();
    const eventId = searchParams.get("eventId") || undefined;

    const include = {
      event: { select: { id: true, title: true, slug: true } },
      requester: { select: { id: true, name: true, email: true, interestsJson: true } },
      booking: {
        select: {
          id: true,
          status: true,
          attendeeName: true,
          ticketTier: { select: { id: true, name: true } },
        },
      },
      booth: { select: { id: true, companyName: true, boothNumber: true, hallName: true } },
    } as const;

    // Attendees read their own lifecycle; organizers and admins read the inbox.
    if (gate.caller.role === "ATTENDEE") {
      // A null email must never enter the filter: Prisma rejects null
      // against the non-nullable requesterEmail column.
      const identity: Array<Record<string, unknown>> = [
        { requesterId: gate.caller.userId },
      ];
      if (gate.caller.email) identity.push({ requesterEmail: gate.caller.email });
      const where: Record<string, unknown> = { OR: identity };
      if (status) where.status = status;
      if (eventId) where.eventId = eventId;
      const requests = await db.meetingRequest.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ success: true, requests, total: requests.length });
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (gate.caller.role !== "ADMIN") {
      where.event = { organizerId: gate.caller.userId };
    }

    const [requests, total, pending] = await db.$transaction([
      db.meetingRequest.findMany({
        where,
        include,
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
