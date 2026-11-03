import { db } from "@/lib/db";

/**
 * Promote the oldest pending waitlist entry for a tier, but only when the
 * tier has a free seat. The claim is guarded so two concurrent cancellations
 * cannot promote the same person twice.
 */
export async function promoteWaitlist(ticketTierId: string) {
  const tier = await db.ticketTier.findUnique({
    where: { id: ticketTierId },
    select: { soldCount: true, capacity: true },
  });
  if (!tier || tier.soldCount >= tier.capacity) return null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const next = await db.waitlistEntry.findFirst({
      where: { ticketTierId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        event: { select: { title: true, slug: true } },
        ticketTier: { select: { name: true } },
      },
    });
    if (!next) return null;

    const claimed = await db.waitlistEntry.updateMany({
      where: { id: next.id, status: "PENDING" },
      data: { status: "PROMOTED", promotedAt: new Date() },
    });
    if (claimed.count === 1) return next;
  }

  return null;
}
