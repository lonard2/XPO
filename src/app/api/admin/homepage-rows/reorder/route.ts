import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { HOMEPAGE_REGIONS } from "@/lib/homepage/rows";

const ReorderSchema = z.object({
  regionId: z.enum(HOMEPAGE_REGIONS).nullable(),
  orderedIds: z.array(z.string().trim().min(1)),
});

/** PUT /api/admin/homepage-rows/reorder — renumbers one scope transactionally. */
export async function PUT(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const body = await request.json().catch(() => ({}));
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Bad Request: regionId and orderedIds are required.", 400);
    }
    const { regionId, orderedIds } = parsed.data;

    const rows = await db.homepageRow.findMany({
      where: { regionId },
      select: { id: true },
    });
    const scopeIds = new Set(rows.map((row) => row.id));
    if (orderedIds.some((id) => !scopeIds.has(id))) {
      return apiError("Bad Request: every ordered id must belong to this scope.", 400);
    }
    if (new Set(orderedIds).size !== orderedIds.length) {
      return apiError("Bad Request: ordered ids must be unique.", 400);
    }

    // Ids not mentioned keep their relative order after the listed ones.
    const rest = rows
      .map((row) => row.id)
      .filter((id) => !orderedIds.includes(id));
    const finalOrder = [...orderedIds, ...rest];

    await db.$transaction(
      finalOrder.map((id, index) =>
        db.homepageRow.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    const saved = await db.homepageRow.findMany({
      where: { regionId },
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ success: true, rows: saved });
  } catch (error) {
    return apiError(`Failed to reorder homepage rows: ${(error as Error).message}`, 500);
  }
}
