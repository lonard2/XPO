import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";
import { PAGE_SIZES, VISIBILITY } from "@/lib/discovery/presentation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const PresentationSchema = z.object({
  pageSize: z.enum(PAGE_SIZES).nullable().optional(),
  visibility: z.enum(VISIBILITY).optional(),
});

/**
 * PATCH /api/admin/events/[id]/presentation — platform curation of page
 * size and visibility. Absent means unchanged; null pageSize clears the
 * explicit choice back to venue suggestion.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = PresentationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Bad Request: invalid presentation payload.", 400);
    }
    const { pageSize, visibility } = parsed.data;
    if (pageSize === undefined && visibility === undefined) {
      return apiError(
        "Bad Request: pageSize or visibility is required.",
        400
      );
    }

    const event = await db.event.findFirst({
      where: { ...idOrSlugWhere(id) },
      select: { id: true },
    });
    if (!event) {
      return apiError(`Event not found: No event matches identifier "${id}".`, 404);
    }

    const updatedEvent = await db.event.update({
      where: { id: event.id },
      data: {
        ...(pageSize !== undefined ? { pageSize } : {}),
        ...(visibility !== undefined ? { visibility } : {}),
      },
      include: {
        organizer: true,
        venue: true,
        venueHall: true,
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: `Presentation for "${updatedEvent.title}" saved successfully.`,
    });
  } catch (error) {
    return apiError(`Failed to save presentation: ${(error as Error).message}`, 500);
  }
}
