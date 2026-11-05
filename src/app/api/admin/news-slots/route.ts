import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { NEWS_SLOTS_MAX } from "@/lib/news/validation";

const SlotsSchema = z.object({
  regionId: z.enum(["id", "jp", "global"]),
  slots: z.array(z.string().trim().min(1)).max(NEWS_SLOTS_MAX),
});

/**
 * Hand-ordered homepage rail picks per region. PUT replaces the region's
 * order transactionally: every id must resolve to an APPROVED update.
 */
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") ?? "id";
    if (!["id", "jp", "global"].includes(region)) {
      return apiError("Bad Request: region must be id, jp, or global.", 400);
    }

    const slots = await db.homepageNewsSlot.findMany({
      where: { regionId: region },
      include: {
        update: {
          include: {
            event: { select: { id: true, title: true, slug: true } },
          },
        },
      },
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ success: true, slots });
  } catch (error) {
    return apiError(`Failed to list news slots: ${(error as Error).message}`, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const body = await request.json().catch(() => ({}));
    const parsed = SlotsSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Bad Request: regionId (id|jp|global) and up to ${NEWS_SLOTS_MAX} slot ids are required.`,
        400
      );
    }
    const { regionId, slots } = parsed.data;

    const rows = await db.eventUpdate.findMany({
      where: { id: { in: slots } },
      select: { id: true, status: true },
    });
    if (rows.length !== slots.length) {
      return apiError("Bad Request: every slot id must match an update.", 404);
    }
    if (rows.some((r) => r.status !== "APPROVED")) {
      return apiError("Bad Request: only APPROVED updates can be slotted.", 400);
    }

    await db.$transaction([
      db.homepageNewsSlot.deleteMany({ where: { regionId } }),
      ...(slots.length > 0
        ? [
            db.homepageNewsSlot.createMany({
              data: slots.map((updateId, position) => ({
                updateId,
                regionId,
                position,
              })),
            }),
          ]
        : []),
    ]);

    const saved = await db.homepageNewsSlot.findMany({
      where: { regionId },
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ success: true, slots: saved });
  } catch (error) {
    return apiError(`Failed to save news slots: ${(error as Error).message}`, 500);
  }
}
