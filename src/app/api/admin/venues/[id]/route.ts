import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/observability/audit";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";
import { isSpaceKind, isVenueType } from "@/lib/discovery/venueTypes";

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
        ...idOrSlugWhere(id),
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
      return apiError(`Venue not found with identifier '${id}'.`, 404);
    }

    return NextResponse.json({
      success: true,
      venue,
    });
  } catch (error) {
    return apiError(`Failed to retrieve venue: ${(error as Error).message}`, 500);
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
      size,
      type,
      capacity,
    } = body;

    const existingVenue = await db.venue.findFirst({
      where: { ...idOrSlugWhere(id) },
      include: { halls: true },
    });

    if (!existingVenue) {
      return apiError(`Venue not found with identifier '${id}'.`, 404);
    }

    // Update venue metadata
    if (size !== undefined && size !== null && !["LARGE", "MEDIUM", "SMALL"].includes(size)) {
      return apiError("Bad Request: size must be LARGE, MEDIUM, or SMALL.", 400);
    }
    if (type !== undefined && type !== null && !isVenueType(type)) {
      return apiError(
        "Bad Request: type must be CONVENTION_CENTER, EXHIBITION_CENTER, ARENA, STADIUM, MALL, HOTEL, COMMUNITY_HALL, or OUTDOOR.",
        400
      );
    }
    if (Array.isArray(halls)) {
      const badKind = halls.find(
        (h: any) => h?.kind !== undefined && !isSpaceKind(h.kind)
      );
      if (badKind) {
        return apiError(
          "Bad Request: every space kind must be HALL, MEETING_ROOM, ARENA, FIELD, COURT, ATRIUM, PAVILION, BALLROOM, or OUTDOOR.",
          400
        );
      }
    }
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
        size: size !== undefined && size !== null ? size : existingVenue.size,
        type: type !== undefined && type !== null ? type : existingVenue.type,
        capacity:
          capacity !== undefined ? numOrNull(capacity) : existingVenue.capacity,
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
        const existingHall = h.id
          ? existingVenue.halls.find((hall) => hall.id === h.id)
          : undefined;
        const data = {
          name: h.name || "Main Hall",
          // A partial update must not reset an arena, field, or ballroom to HALL.
          kind: h.kind ?? existingHall?.kind ?? "HALL",
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
    return apiError(`Failed to update venue: ${(error as Error).message}`, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existingVenue = await db.venue.findFirst({
      where: { ...idOrSlugWhere(id) },
    });

    if (!existingVenue) {
      return apiError(`Venue not found with identifier '${id}'.`, 404);
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
    return apiError(`Failed to delete venue: ${(error as Error).message}`, 500);
  }
}
