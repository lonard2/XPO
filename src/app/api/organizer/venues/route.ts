import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parsePagination } from "@/lib/api/pagination";

/**
 * GET /api/organizer/venues — public venue directory with halls.
 * Reads stay open (organizers need real venues and hall IDs to create
 * events); venue governance remains admin-only elsewhere.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("regionId")?.toLowerCase();
    const { take, skip } = parsePagination(searchParams);
    const where: any = {};
    if (regionId && regionId !== "all") where.regionId = regionId;
    const [total, venues] = await db.$transaction([
      db.venue.count({ where }),
      db.venue.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          regionId: true,
          halls: {
            select: { id: true, name: true, capacity: true, kind: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
        take,
        skip,
      }),
    ]);
    return NextResponse.json({ success: true, venues, total, take, skip });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch venues: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
