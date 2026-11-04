import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";
import { normalizeInterests } from "@/lib/matching/suggest";

/**
 * GET /api/profile/export — the signed-in user's portable data.
 * Profile, passes, meeting requests, waitlist entries, booth claims and
 * suppression state, as a JSON download. 401 without a session.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const userId = gate.caller.userId as string;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        jobTitle: true,
        interestsJson: true,
        createdAt: true,
      },
    });
    if (!user) {
      return apiError("NOT_FOUND: user does not exist.", 404);
    }

    let interests: string[] = [];
    try {
      interests = normalizeInterests(JSON.parse(user.interestsJson));
    } catch {
      interests = [];
    }

    const [bookings, requests, booths, suppression] = await Promise.all([
      db.booking.findMany({
        where: { userId },
        include: {
          event: { select: { id: true, title: true, slug: true } },
          ticketTier: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.meetingRequest.findMany({
        where: { OR: [{ requesterId: userId }, { requesterEmail: user.email }] },
        include: { event: { select: { id: true, title: true } } },
        orderBy: { createdAt: "asc" },
      }),
      db.boothTenant.findMany({
        where: { userId },
        include: { event: { select: { id: true, title: true } } },
      }),
      db.emailSuppression.findUnique({ where: { email: user.email.toLowerCase() } }),
    ]);

    const waitlist = await db.waitlistEntry.findMany({
      where: { email: { in: [user.email, user.email.toLowerCase()] } },
      include: { event: { select: { id: true, title: true } } },
    });

    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        organization: user.organization,
        jobTitle: user.jobTitle,
        interests,
        createdAt: user.createdAt,
      },
      bookings: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        attendeeName: b.attendeeName,
        attendeeEmail: b.attendeeEmail,
        event: b.event,
        tier: b.ticketTier,
        createdAt: b.createdAt,
      })),
      meetingRequests: requests,
      waitlistEntries: waitlist,
      boothClaims: booths,
      emailSuppressed: suppression?.reason ?? null,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="xpo-data-export.json"`,
      },
    });
  } catch (error) {
    reportError("profile-export", error);
    return apiError("INTERNAL_ERROR: could not export the profile.", 500);
  }
}
