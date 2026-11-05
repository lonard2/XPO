import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/envelope";

/**
 * GET /api/admin/updates?status=DRAFT|APPROVED&region=id|jp|global
 * Pending-updates inbox with event context.
 */
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const region = searchParams.get("region");
    if (status !== null && status !== "DRAFT" && status !== "APPROVED") {
      return apiError("Bad Request: status must be DRAFT or APPROVED.", 400);
    }
    if (region !== null && !["id", "jp", "global"].includes(region)) {
      return apiError("Bad Request: region must be id, jp, or global.", 400);
    }

    const updates = await db.eventUpdate.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(region ? { event: { regionId: region } } : {}),
      },
      include: {
        event: { select: { id: true, title: true, slug: true, regionId: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, updates });
  } catch (error) {
    return apiError(`Failed to list updates: ${(error as Error).message}`, 500);
  }
}
