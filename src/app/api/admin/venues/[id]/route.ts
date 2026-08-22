import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const venue = await db.venue.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        region: true,
        halls: true,
        events: {
          include: {
            ticketTiers: true,
            booths: true,
          },
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: `Venue not found with identifier '${id}'.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve venue: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const existingVenue = await db.venue.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { halls: true },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { success: false, error: `Venue not found with identifier '${id}'.` },
        { status: 404 }
      );
    }

    // Update venue metadata
    const updatedVenue = await db.venue.update({
      where: { id: existingVenue.id },
      data: {
        name: name ? name.trim() : existingVenue.name,
        regionId: regionId ? regionId.toLowerCase() : existingVenue.regionId,
        city: city ? city.trim() : existingVenue.city,
        address: address ? address.trim() : existingVenue.address,
        latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : existingVenue.latitude,
        longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : existingVenue.longitude,
        transitInfo: transitInfo !== undefined ? transitInfo : existingVenue.transitInfo,
        imageUrl: imageUrl !== undefined ? imageUrl : existingVenue.imageUrl,
      },
    });

    // Update halls if provided
    if (Array.isArray(halls)) {
      // Delete old halls
      await db.venueHall.deleteMany({
        where: { venueId: existingVenue.id },
      });

      // Insert updated halls
      if (halls.length > 0) {
        await db.venueHall.createMany({
          data: halls.map((h: any) => ({
            venueId: existingVenue.id,
            name: h.name || "Main Hall",
            capacity: h.capacity ? parseInt(h.capacity, 10) : 2000,
            floorAreaSqm: h.floorAreaSqm ? parseFloat(h.floorAreaSqm) : 4000,
            description: h.description || null,
          })),
        });
      }
    }

    const finalVenue = await db.venue.findUnique({
      where: { id: existingVenue.id },
      include: { region: true, halls: true },
    });

    return NextResponse.json({
      success: true,
      message: `Venue '${finalVenue?.name}' successfully updated.`,
      venue: finalVenue,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update venue: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existingVenue = await db.venue.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { success: false, error: `Venue not found with identifier '${id}'.` },
        { status: 404 }
      );
    }

    // Delete venue (cascade deletes halls)
    await db.venue.delete({
      where: { id: existingVenue.id },
    });

    return NextResponse.json({
      success: true,
      message: `Venue '${existingVenue.name}' deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete venue: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
