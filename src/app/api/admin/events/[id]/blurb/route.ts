import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";
import { EDITORIAL_LOCALES } from "@/lib/discovery/editorial";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const BlurbSchema = z.object({
  editorialBlurb: z.string().max(280).nullable().optional(),
  editorialBlurbI18n: z
    .partialRecord(z.enum(EDITORIAL_LOCALES), z.string().max(280))
    .optional(),
  editorialApproved: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // RBAC Authorization Check
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const parsed = BlurbSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Bad Request: invalid editorial blurb payload.", 400);
    }
    const { editorialBlurb, editorialBlurbI18n, editorialApproved } =
      parsed.data;
    if (
      editorialBlurb === undefined &&
      editorialBlurbI18n === undefined &&
      editorialApproved === undefined
    ) {
      return apiError(
        "Bad Request: editorialBlurb, editorialBlurbI18n, or editorialApproved is required.",
        400
      );
    }

    const event = await db.event.findFirst({
      where: {
        ...idOrSlugWhere(id),
      },
    });

    if (!event) {
      return apiError(`Event not found: No event matches identifier "${id}".`, 404);
    }

    // Absent means unchanged; null/"" clears. A provided i18n map replaces
    // the stored map wholesale; empty-string values count as unset at
    // resolution time, so clearing one locale never needs the full map.
    const updatedEvent = await db.event.update({
      where: { id: event.id },
      data: {
        ...(editorialBlurb !== undefined ? { editorialBlurb } : {}),
        ...(editorialBlurbI18n !== undefined
          ? { editorialBlurbI18n }
          : {}),
        ...(editorialApproved !== undefined ? { editorialApproved } : {}),
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
      message: `Editorial blurb for "${updatedEvent.title}" saved successfully.`,
    });
  } catch (error) {
    return apiError(`Failed to save editorial blurb: ${(error as Error).message}`, 500);
  }
}
