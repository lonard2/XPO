import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import {
  RowInputSchema,
  validateEventIds,
  renumberScope,
  nextPosition,
} from "@/lib/homepage/adminRows";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PUT /api/admin/homepage-rows/[id] — update fields, copy, or scope. */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { id } = await params;
    const existing = await db.homepageRow.findUnique({ where: { id } });
    if (!existing) {
      return apiError(`Homepage row not found: ${id}`, 404);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = RowInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        "Bad Request: title (1-80), subtitle (max 160), and at most 8 events are required.",
        400
      );
    }
    const input = parsed.data;
    if (!(await validateEventIds(input.eventIds))) {
      return apiError("Bad Request: every event id must be a public event that has not ended.", 400);
    }

    const nextRegion =
      input.regionId !== undefined ? input.regionId : existing.regionId;
    const moving = nextRegion !== existing.regionId;
    let position = existing.position;
    if (moving) {
      const siblings = await db.homepageRow.findMany({
        where: { regionId: nextRegion },
        select: { position: true },
      });
      position = nextPosition(siblings);
    }

    const row = await db.homepageRow.update({
      where: { id },
      data: {
        title: input.title,
        titleI18n: input.titleI18n ?? undefined,
        subtitle: input.subtitle !== undefined ? input.subtitle : existing.subtitle,
        subtitleI18n: input.subtitleI18n ?? undefined,
        regionId: nextRegion,
        position,
        eventIdsJson: JSON.stringify(input.eventIds),
        isActive:
          input.isActive !== undefined ? input.isActive : existing.isActive,
      },
    });

    if (moving) {
      await renumberScope(existing.regionId);
      await renumberScope(nextRegion);
    } else {
      await renumberScope(nextRegion);
    }

    return NextResponse.json({ success: true, row });
  } catch (error) {
    return apiError(`Failed to update homepage row: ${(error as Error).message}`, 500);
  }
}

/** DELETE /api/admin/homepage-rows/[id] */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { id } = await params;
    const existing = await db.homepageRow.findUnique({ where: { id } });
    if (!existing) {
      return apiError(`Homepage row not found: ${id}`, 404);
    }

    await db.homepageRow.delete({ where: { id } });
    await renumberScope(existing.regionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(`Failed to delete homepage row: ${(error as Error).message}`, 500);
  }
}
