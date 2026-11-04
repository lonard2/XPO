import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { brandingConfig, title, heroImageUrl } = body;

    const existing = await db.event.findFirst({
      where: {
        ...idOrSlugWhere(id),
      },
    });

    if (!existing) {
      return apiError(`Event not found for ID: ${id}`, 404);
    }

    // Strict ownership: ADMIN may brand anything; organizers only their own
    // events; platform-curated events are admin-only.
    const caller = await resolveEventCaller(request);
    if (!canWriteEvent(caller, existing.organizerId)) {
      return apiError("Forbidden: Only the owning organizer or a platform administrator can update this event's branding.", 403);
    }

    const updated = await db.event.update({
      where: { id: existing.id },
      data: {
        ...(title ? { title } : {}),
        ...(heroImageUrl ? { heroImageUrl } : {}),
        brandingConfigJson: typeof brandingConfig === "string"
          ? brandingConfig
          : JSON.stringify(brandingConfig || {}),
      },
    });

    await audit(request, { action: "event.branding", entity: "event", entityId: updated.id });
    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return apiError(`Failed to update branding: ${(error as Error).message}`, 500);
  }
}
