import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";
import { revertUpdateToDraft } from "@/lib/news/slots";

interface RouteParams {
  params: Promise<{ updateId: string }>;
}

/**
 * PATCH /api/admin/updates/[updateId] — approve or unapprove.
 * Approval stamps who/when; unapproval clears stamps and evicts any
 * homepage slot so dead rail cards cannot render.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { updateId } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = z.object({ approved: z.boolean() }).safeParse(body);
    if (!parsed.success) {
      return apiError("Bad Request: approved boolean is required.", 400);
    }

    const row = await db.eventUpdate.findUnique({ where: { id: updateId } });
    if (!row) {
      return apiError(`Update not found: ${updateId}`, 404);
    }

    if (parsed.data.approved) {
      const caller = gate.caller;
      const updated = await db.eventUpdate.update({
        where: { id: row.id },
        data: {
          status: "APPROVED",
          approvedBy: caller.userId || caller.email || "admin",
          approvedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, update: updated });
    }

    const updated = await revertUpdateToDraft(row.id);
    return NextResponse.json({ success: true, update: updated });
  } catch (error) {
    return apiError(`Failed to moderate update: ${(error as Error).message}`, 500);
  }
}
