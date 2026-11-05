import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";
import { EventUpdateInput } from "@/lib/news/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/events/[id]/updates — admin-side authorship, including
 * ownerless platform-curated events. Admin copy publishes immediately.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { id } = await params;
    const event = await db.event.findFirst({
      where: { ...idOrSlugWhere(id) },
      select: { id: true },
    });
    if (!event) {
      return apiError(`Event not found for ID: ${id}`, 404);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = EventUpdateInput.safeParse(body);
    if (!parsed.success) {
      return apiError("Bad Request: title (1-120) and body (1-500) are required.", 400);
    }

    const caller = gate.caller;
    const created = await db.eventUpdate.create({
      data: {
        eventId: event.id,
        authorId: caller.userId,
        title: parsed.data.title,
        body: parsed.data.body,
        status: "APPROVED",
        approvedBy: caller.userId || caller.email || "admin",
        approvedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, update: created });
  } catch (error) {
    return apiError(`Failed to author update: ${(error as Error).message}`, 500);
  }
}
