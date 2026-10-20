import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/observability/audit";

/** Parse an optional numeric hall spec; garbage becomes null, never NaN. */
function numOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

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

    // Update halls if provided: match by id so surviving halls keep their
    // identity (event.venueHallId links stay valid); create new rows; delete
    // only halls absent from the payload.
    if (Array.isArray(halls)) {
      const existingIds = new Set(existingVenue.halls.map((h) => h.id));
      const payloadIds = new Set(
        halls.filter((h: any) => h.id && existingIds.has(h.id)).map((h: any) => h.id)
      );

      for (const h of halls) {
        const data = {
          name: h.name || "Main Hall",
          kind: h.kind === "MEETING_ROOM" ? "MEETING_ROOM" : "HALL",
          capacity: h.capacity ? parseInt(h.capacity, 10) : 2000,
          floorAreaSqm: h.floorAreaSqm ? parseFloat(h.floorAreaSqm) : 4000,
          ceilingHeightM: numOrNull(h.ceilingHeightM),
          floorLoadKnM2: numOrNull(h.floorLoadKnM2),
          description: h.description || null,
        };
        if (h.id && existingIds.has(h.id)) {
          await db.venueHall.update({ where: { id: h.id }, data });
        } else {
          await db.venueHall.create({ data: { ...data, venueId: existingVenue.id } });
        }
      }

      const removedIds = [...existingIds].filter((id) => !payloadIds.has(id));
      if (removedIds.length > 0) {
        await db.venueHall.deleteMany({ where: { id: { in: removedIds } } });
      }
    }

    const finalVenue = await db.venue.findUnique({
      where: { id: existingVenue.id },
      include: { region: true, halls: true },
    });

    await audit(req, { action: "venue.update", entity: "venue", entityId: finalVenue?.id, metadata: { name: finalVenue?.name } });
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

    await audit(req, { action: "venue.delete", entity: "venue", entityId: existingVenue.id, metadata: { name: existingVenue.name } });
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
