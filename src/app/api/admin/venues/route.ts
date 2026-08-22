import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeEventSlug } from "@/lib/crawler/venueScraper";
import { FALLBACK_VENUES } from "@/lib/discovery/fallbackData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get("regionId")?.toLowerCase();
    const search = searchParams.get("search")?.toLowerCase().trim();

    const where: any = {};
    if (regionId && regionId !== "all") {
      where.regionId = regionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
      ];
    }

    let venues: any[] = [];
    try {
      venues = await db.venue.findMany({
        where,
        include: {
          region: true,
          halls: true,
          events: {
            select: { id: true, title: true, startDate: true, archetype: true },
          },
        },
        orderBy: { name: "asc" },
      });
    } catch {
      // Fallback data if db error
      venues = FALLBACK_VENUES;
    }

    if (venues.length === 0 && !search && (!regionId || regionId === "all")) {
      venues = FALLBACK_VENUES;
    }

    return NextResponse.json({
      success: true,
      count: venues.length,
      venues,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch venues: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      regionId,
      city,
      address,
      latitude,
      longitude,
      transitInfo,
      imageUrl,
      halls,
    } = body;

    if (!name || !regionId || !city || !address) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, regionId, city, and address are mandatory.",
        },
        { status: 400 }
      );
    }

    // Ensure valid region exists
    let region = await db.region.findUnique({ where: { id: regionId.toLowerCase() } });
    if (!region) {
      region = await db.region.create({
        data: {
          id: regionId.toLowerCase(),
          name: regionId.toUpperCase() === "ID" ? "Indonesia" : regionId.toUpperCase() === "JP" ? "Japan" : "Global Hubs",
          code: regionId.toUpperCase(),
          currency: regionId.toLowerCase() === "id" ? "IDR" : regionId.toLowerCase() === "jp" ? "JPY" : "USD",
        },
      });
    }

    // Generate slug
    let baseSlug = normalizeEventSlug(name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await db.venue.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create Venue with nested halls in Prisma
    const createdVenue = await db.venue.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        regionId: region.id,
        city: city.trim(),
        address: address.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        transitInfo: transitInfo || "Rapid transit express and airport shuttle bus connection.",
        imageUrl: imageUrl || "/images/venues/convention-center.jpg",
        halls: {
          create: Array.isArray(halls) && halls.length > 0
            ? halls.map((h: any) => ({
                name: h.name || "Exhibition Hall 1",
                capacity: h.capacity ? parseInt(h.capacity, 10) : 2500,
                floorAreaSqm: h.floorAreaSqm ? parseFloat(h.floorAreaSqm) : 5000,
                description: h.description || null,
              }))
            : [
                {
                  name: "Plenary & Main Hall",
                  capacity: 3500,
                  floorAreaSqm: 6500,
                  description: "Central column-free exhibition and assembly hall.",
                },
              ],
        },
      },
      include: {
        region: true,
        halls: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Venue '${createdVenue.name}' created successfully with ${createdVenue.halls.length} halls.`,
        venue: createdVenue,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create venue: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
