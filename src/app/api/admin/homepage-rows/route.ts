import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { listingWhere } from "@/lib/discovery/presentation";
import { HOMEPAGE_REGIONS } from "@/lib/homepage/rows";
import {
  RowInputSchema,
  validateEventIds,
  nextPosition,
  renumberScope,
} from "@/lib/homepage/adminRows";

const SCOPES = [...HOMEPAGE_REGIONS, "all"] as const;

/**
 * GET /api/admin/homepage-rows?region=id|jp|global|all
 * Rows for one scope plus the public attendable events the picker can offer.
 */
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("region") ?? "id";
    if (!(SCOPES as readonly string[]).includes(scope)) {
      return apiError("Bad Request: region must be id, jp, global, or all.", 400);
    }
    const regionId = scope === "all" ? null : scope;

    const [rows, candidates] = await Promise.all([
      db.homepageRow.findMany({
        where: { regionId },
        orderBy: { position: "asc" },
      }),
      db.event.findMany({
        where: {
          ...listingWhere(),
          endDate: { gte: new Date() },
          ...(regionId ? { regionId } : {}),
        },
        select: { id: true, title: true, startDate: true, regionId: true },
        orderBy: { startDate: "asc" },
        take: 200,
      }),
    ]);

    return NextResponse.json({ success: true, rows, candidates });
  } catch (error) {
    return apiError(`Failed to list homepage rows: ${(error as Error).message}`, 500);
  }
}

/** POST /api/admin/homepage-rows — appends at the end of its scope. */
export async function POST(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

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

    const regionId = input.regionId ?? null;
    const existing = await db.homepageRow.findMany({
      where: { regionId },
      select: { position: true },
    });

    const row = await db.homepageRow.create({
      data: {
        title: input.title,
        titleI18n: input.titleI18n ?? undefined,
        subtitle: input.subtitle ?? null,
        subtitleI18n: input.subtitleI18n ?? undefined,
        regionId,
        position: nextPosition(existing),
        eventIdsJson: JSON.stringify(input.eventIds),
      },
    });
    await renumberScope(regionId);

    return NextResponse.json({ success: true, row });
  } catch (error) {
    return apiError(`Failed to create homepage row: ${(error as Error).message}`, 500);
  }
}
