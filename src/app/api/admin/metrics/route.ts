import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveEventCaller } from "@/lib/auth/eventOwnership";

/** GET /api/admin/metrics — admin-only platform overview counts. */
export async function GET(request: Request) {
  try {
    const caller = await resolveEventCaller(request);
    if (caller.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: platform administrators only." }, { status: 403 });
    }
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 3600_000);
    const [
      userGroups,
      eventTotal,
      curatedTotal,
      listingTotal,
      bookingTotal,
      checkedInTotal,
      boothTotal,
      occupiedTotal,
      activeSessions,
      audit24h,
    ] = await db.$transaction([
      db.user.groupBy({ by: ["role"], orderBy: { role: "asc" }, _count: { role: true } }),
      db.event.count(),
      db.event.count({ where: { isPlatformCurated: true } }),
      db.event.count({ where: { isListingOnly: true } }),
      db.booking.count(),
      db.booking.count({ where: { status: "CHECKED_IN" } }),
      db.boothTenant.count(),
      db.boothTenant.count({ where: { NOT: { companyName: "" } } }),
      db.session.count({ where: { expiresAt: { gt: now } } }),
      db.auditLog.count({ where: { createdAt: { gte: dayAgo } } }),
    ]);
    const byRole: Record<string, number> = {};
    for (const g of userGroups) {
      const count =
        typeof g._count === "object" && g._count !== null ? (g._count as { role: number }).role : 0;
      byRole[g.role] = count;
    }
    return NextResponse.json({
      users: { total: Object.values(byRole).reduce((a, b) => a + b, 0), byRole },
      events: { total: eventTotal, curated: curatedTotal, listings: listingTotal },
      bookings: { total: bookingTotal, checkedIn: checkedInTotal },
      booths: {
        total: boothTotal,
        occupied: occupiedTotal,
        occupancyPct: boothTotal > 0 ? Math.round((occupiedTotal / boothTotal) * 100) : 0,
      },
      sessions: { active: activeSessions },
      audit24h,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to load metrics: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
