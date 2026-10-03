import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const hallName = searchParams.get("hallName");

    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (hallName && hallName !== "ALL") where.hallName = hallName;

    const booths = await db.boothTenant.findMany({
      where,
      include: {
        event: {
          include: {
            venue: true,
            venueHall: true,
          },
        },
      },
      orderBy: { boothNumber: "asc" },
    });

    return NextResponse.json({ success: true, booths });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch booths: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch ? decodeURIComponent(roleMatch[1]) : request.headers.get("x-xpo-user-role");

    if (userRole === "ATTENDEE") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Attendee role is not authorized to manage booths. Switch to Organizer or Admin persona." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 1. Bulk CSV Ingestion Path
    if (body.bulk === true && Array.isArray(body.booths)) {
      interface IncomingBoothPayload {
        boothNumber?: string;
        hallName?: string;
        companyName?: string;
        industry?: string;
        websiteUrl?: string;
        logoUrl?: string;
        description?: string;
      }

      const { eventId } = body;
      const incomingBooths: IncomingBoothPayload[] = body.booths;
      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Missing required eventId for bulk import" },
          { status: 400 }
        );
      }
      if (incomingBooths.length === 0) {
        return NextResponse.json(
          { success: false, error: "No booths provided for bulk import" },
          { status: 400 }
        );
      }

      // Check duplicates within incoming array
      const seen = new Set<string>();
      for (const b of incomingBooths) {
        const num = b.boothNumber?.trim();
        if (!num) {
          return NextResponse.json(
            { success: false, error: "Each booth in bulk import must have a valid boothNumber" },
            { status: 400 }
          );
        }
        if (seen.has(num.toLowerCase())) {
          return NextResponse.json(
            { success: false, error: `Duplicate booth lot number "${num}" found in import dataset` },
            { status: 409 }
          );
        }
        seen.add(num.toLowerCase());
      }

      // Check collisions with existing database records for this event
      const existingBooths = await db.boothTenant.findMany({
        where: { eventId },
        select: { boothNumber: true },
      });
      const existingSet = new Set(existingBooths.map((eb) => eb.boothNumber.trim().toLowerCase()));
      const collision = incomingBooths.find(
        (b: IncomingBoothPayload) => b.boothNumber && existingSet.has(b.boothNumber.trim().toLowerCase())
      );
      if (collision) {
        return NextResponse.json(
          { success: false, error: `Booth lot "${collision.boothNumber}" is already allocated for this event in database` },
          { status: 409 }
        );
      }

      const recordsToCreate = incomingBooths.map((b: IncomingBoothPayload) => ({
        eventId,
        companyName: b.companyName?.trim() || "",
        boothNumber: b.boothNumber!.trim(),
        hallName: b.hallName?.trim() || "Main Hall",
        industry: b.industry?.trim() || null,
        websiteUrl: b.websiteUrl?.trim() || null,
        logoUrl: b.logoUrl?.trim() || null,
        description: b.description?.trim() || null,
      }));

      await db.boothTenant.createMany({
        data: recordsToCreate,
      });

      const updatedBooths = await db.boothTenant.findMany({
        where: { eventId },
        include: {
          event: {
            include: {
              venue: true,
              venueHall: true,
            },
          },
        },
        orderBy: { boothNumber: "asc" },
      });

      return NextResponse.json({
        success: true,
        count: recordsToCreate.length,
        booths: updatedBooths,
      }, { status: 201 });
    }

    // 2. Single Booth Creation Path (Supports Available / Vacant Lots)
    const {
      eventId,
      companyName,
      boothNumber,
      hallName,
      industry,
      websiteUrl,
      logoUrl,
      description,
    } = body;

    if (!eventId || !boothNumber || !hallName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (eventId, boothNumber, hallName)" },
        { status: 400 }
      );
    }

    // Collision check for single booth creation
    const existing = await db.boothTenant.findFirst({
      where: {
        eventId,
        boothNumber: boothNumber.trim(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Booth lot "${boothNumber}" is already registered for this event` },
        { status: 409 }
      );
    }

    const booth = await db.boothTenant.create({
      data: {
        eventId,
        companyName: companyName?.trim() || "",
        boothNumber: boothNumber.trim(),
        hallName: hallName.trim(),
        industry: industry?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, booth }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to create booth: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch ? decodeURIComponent(roleMatch[1]) : request.headers.get("x-xpo-user-role");

    if (userRole === "ATTENDEE") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Attendee role is not authorized to update booths. Switch to Organizer or Admin persona." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, companyName, boothNumber, hallName, industry, websiteUrl, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booth ID for update" },
        { status: 400 }
      );
    }

    // If boothNumber is updated, ensure no collision with another booth in the same event
    if (boothNumber) {
      const current = await db.boothTenant.findUnique({ where: { id } });
      if (current && current.boothNumber.trim().toLowerCase() !== boothNumber.trim().toLowerCase()) {
        const collision = await db.boothTenant.findFirst({
          where: {
            eventId: current.eventId,
            boothNumber: boothNumber.trim(),
            id: { not: id },
          },
        });
        if (collision) {
          return NextResponse.json(
            { success: false, error: `Booth lot "${boothNumber}" is already allocated for another tenant in this event` },
            { status: 409 }
          );
        }
      }
    }

    const updateData: any = {};
    if (companyName !== undefined) updateData.companyName = companyName !== null ? companyName.trim() : "";
    if (boothNumber !== undefined) updateData.boothNumber = boothNumber.trim();
    if (hallName !== undefined) updateData.hallName = hallName.trim();
    if (industry !== undefined) updateData.industry = industry ? industry.trim() : null;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl ? websiteUrl.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    const updated = await db.boothTenant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, booth: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to update booth: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function DELETE(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch ? decodeURIComponent(roleMatch[1]) : request.headers.get("x-xpo-user-role");

    if (userRole === "ATTENDEE") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Attendee role is not authorized to delete booths. Switch to Organizer or Admin persona." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // Query param fallback
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booth ID for deletion" },
        { status: 400 }
      );
    }

    const existing = await db.boothTenant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Booth lot not found or already deleted" },
        { status: 404 }
      );
    }

    await db.boothTenant.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Booth lot "${existing.boothNumber}" decommissioned successfully`,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to delete booth: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
