import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/organizer/tiers/[id] — set a tier's hosted-buyer meeting quota.
 * 0 means unlimited. Only the owning organizer or an admin may change it.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const quota = Number(body.meetingQuota);

    if (!Number.isInteger(quota) || quota < 0 || quota > 1000) {
      return apiError("VALIDATION_ERROR: meetingQuota must be an integer from 0 to 1000.", 400);
    }

    const tier = await db.ticketTier.findUnique({
      where: { id },
      include: { event: { select: { id: true, organizerId: true } } },
    });
    if (!tier) {
      return apiError("NOT_FOUND: ticket tier does not exist.", 404);
    }
    if (!canWriteEvent(gate.caller, tier.event.organizerId)) {
      return apiError("Forbidden: only the owning organizer can set quotas.", 403);
    }

    const updated = await db.ticketTier.update({
      where: { id },
      data: { meetingQuota: quota },
      select: { id: true, name: true, meetingQuota: true },
    });

    await audit(request, {
      action: "tier.quota.update",
      entity: "TicketTier",
      entityId: id,
      metadata: { eventId: tier.eventId, meetingQuota: quota },
    });

    return NextResponse.json({ success: true, tier: updated });
  } catch (error) {
    reportError("tier-quota", error);
    return apiError("INTERNAL_ERROR: could not set the quota.", 500);
  }
}
