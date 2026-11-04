import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { validateShowcase } from "@/lib/showcase";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";

interface RouteProps {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/organizer/events/[id]/showcase — replace the organizer-authored
 * showcase content (stream, program rows, alerts, channels). Strict ownership:
 * ADMIN or the owning organizer. Payload is validated (URLs, row caps);
 * invalid rows are rejected, never stored.
 */
export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const existing = await db.event.findFirst({
      where: { ...idOrSlugWhere(id) },
      select: { id: true, organizerId: true },
    });

    if (!existing) {
      return apiError(`Event not found for ID: ${id}`, 404);
    }

    const caller = await resolveEventCaller(request);
    if (!canWriteEvent(caller, existing.organizerId)) {
      return apiError("Forbidden: Only the owning organizer or a platform administrator can edit showcase content.", 403);
    }

    // Attestation is mandatory on every save: the publisher confirms accuracy.
    if (body.attested !== true) {
      return apiError("Attestation required: confirm the content is accurate before saving.", 400);
    }

    const parsed = validateShowcase(body.showcase ?? body);
    if (!parsed.ok) {
      return apiError("Invalid showcase content.", 400, { issues: parsed.issues });
    }

    const nowIso = new Date().toISOString();
    const updated = await db.event.update({
      where: { id: existing.id },
      data: {
        showcaseJson: JSON.stringify({
          ...parsed.data,
          attested: true,
          attestedBy: caller.userId || caller.email || caller.role || "unknown",
          attestedAt: nowIso,
          updatedAt: nowIso,
        }),
      },
      select: { id: true, slug: true, showcaseJson: true, updatedAt: true },
    });

    await audit(request, { action: "event.showcase", entity: "event", entityId: updated.id });
    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return apiError(`Failed to update showcase: ${(error as Error).message}`, 500);
  }
}
