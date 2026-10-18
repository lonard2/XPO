import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";
import { validateShowcase } from "@/lib/showcase";

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
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, organizerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Event not found for ID: ${id}` },
        { status: 404 }
      );
    }

    const caller = getEventCaller(request);
    if (!canWriteEvent(caller, existing.organizerId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only the owning organizer or a platform administrator can edit showcase content.",
        },
        { status: 403 }
      );
    }

    // Attestation is mandatory on every save: the publisher confirms accuracy.
    if (body.attested !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "Attestation required: confirm the content is accurate before saving.",
        },
        { status: 400 }
      );
    }

    const parsed = validateShowcase(body.showcase ?? body);
    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid showcase content.", issues: parsed.issues },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to update showcase: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
