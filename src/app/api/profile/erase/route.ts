import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

const DELETED_NAME = "Deleted User";

/**
 * DELETE /api/profile — erase the signed-in user's personal data.
 * Body must confirm explicitly: `{ "confirm": "DELETE" }`.
 *
 * What happens: sessions and OTP rows are deleted (instant logout
 * everywhere); the profile is anonymized; booking, request and waitlist
 * holder fields are scrubbed to the anonymous label; booth claims are
 * unlinked. Operational rows (bookings, reports, audit) stay, because the
 * organizer's attendance and history truth must survive any one delegate.
 * The full policy lives in docs/operations/privacy.md.
 */
export async function DELETE(request: Request) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.confirm !== "DELETE") {
      return apiError(
        'VALIDATION_ERROR: confirm with { "confirm": "DELETE" } to erase personal data.',
        400
      );
    }

    const userId = gate.caller.userId as string;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError("NOT_FOUND: user does not exist.", 404);
    }

    const anonEmail = `deleted-${user.id}@deleted.local`;
    const emails = [user.email, user.email.toLowerCase()];

    const [bookings, requests, waitlist, booths] = await db.$transaction([
      db.booking.updateMany({
        where: { userId },
        data: { attendeeName: DELETED_NAME, attendeeEmail: anonEmail },
      }),
      db.meetingRequest.updateMany({
        where: { requesterId: userId },
        data: { requesterId: null, requesterName: DELETED_NAME, requesterEmail: anonEmail },
      }),
      db.waitlistEntry.updateMany({
        where: { email: { in: emails } },
        data: { name: DELETED_NAME, email: anonEmail },
      }),
      db.boothTenant.updateMany({
        where: { userId },
        data: { userId: null, claimStatus: "UNCLAIMED", claimedAt: null },
      }),
    ]);

    await db.session.deleteMany({ where: { userId } });
    await db.otpCode.deleteMany({ where: { userId } });
    await db.otpCode.deleteMany({ where: { email: { in: emails } } });
    await db.emailSuppression.deleteMany({ where: { email: { in: emails } } });

    await db.user.update({
      where: { id: userId },
      data: {
        name: DELETED_NAME,
        email: anonEmail,
        organization: null,
        jobTitle: null,
        avatarUrl: null,
        interestsJson: "[]",
        settingsJson: null,
        passwordHash: null,
        emailVerifiedAt: null,
      },
    });

    await audit(request, {
      action: "profile.erase",
      entity: "User",
      entityId: userId,
      metadata: {
        bookings: bookings.count,
        requests: requests.count,
        waitlist: waitlist.count,
        booths: booths.count,
      },
    });

    return NextResponse.json({
      success: true,
      erased: {
        bookings: bookings.count,
        meetingRequests: requests.count,
        waitlistEntries: waitlist.count,
        boothClaims: booths.count,
      },
    });
  } catch (error) {
    reportError("profile-erase", error);
    return apiError("INTERNAL_ERROR: could not erase personal data.", 500);
  }
}
