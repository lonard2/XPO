import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

/**
 * GET /api/admin/users?role=ORGANIZER — minimal user directory for admin
 * assignment workflows (e.g. attaching an organizer to a curated event).
 * ADMIN only: this is not a public user enumeration endpoint.
 */
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, ["ADMIN"]);
    if (gate.response) return gate.response;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role")?.toUpperCase();

    const users = await db.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to list users: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
