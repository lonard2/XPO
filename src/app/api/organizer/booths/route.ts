import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEventWrites, requireBoothWrites } from "@/lib/auth/eventOwnership";

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
        dimensions?: string;
        areaSqm?: number | string;
        boothType?: string;
      }

      const { eventId } = body;
      const incomingBooths: IncomingBoothPayload[] = body.booths;
      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Missing required eventId for bulk import" },
          { status: 400 }
        );
      }
      // Strict ownership on the parent event before ingesting anything.
      const bulkGate = await requireEventWrites(request, [eventId], db);
      if (!bulkGate.ok) {
        return NextResponse.json(
          { success: false, error: bulkGate.error },
          { status: bulkGate.status }
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
        dimensions: b.dimensions?.trim() || null,
        areaSqm: typeof b.areaSqm === "number" ? b.areaSqm : (b.areaSqm ? parseFloat(String(b.areaSqm)) : null),
        boothType: b.boothType?.trim() || null,
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
      dimensions,
      areaSqm,
      boothType,
    } = body;

    if (!eventId || !boothNumber || !hallName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (eventId, boothNumber, hallName)" },
        { status: 400 }
      );
    }

    // Strict ownership on the parent event.
    const singleGate = await requireEventWrites(request, [eventId], db);
    if (!singleGate.ok) {
      return NextResponse.json(
        { success: false, error: singleGate.error },
        { status: singleGate.status }
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
        dimensions: dimensions?.trim() || null,
        areaSqm: typeof areaSqm === "number" ? areaSqm : (areaSqm ? parseFloat(String(areaSqm)) : null),
        boothType: boothType?.trim() || null,
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

    // 1. Bulk Batch Update (e.g. Bulk Vacate Tenants)
    if (body.bulk === true && Array.isArray(body.ids)) {
      const ids: string[] = body.ids;
      if (ids.length === 0) {
        return NextResponse.json(
          { success: false, error: "No IDs provided for bulk update" },
          { status: 400 }
        );
      }
      // Strict ownership on every parent event before touching any booth.
      const bulkUpdateGate = await requireBoothWrites(request, ids, db);
      if (!bulkUpdateGate.ok) {
        return NextResponse.json(
          { success: false, error: bulkUpdateGate.error },
          { status: bulkUpdateGate.status }
        );
      }
      const updateData: Record<string, unknown> = {};
      if (body.companyName !== undefined) updateData.companyName = body.companyName !== null ? body.companyName.trim() : "";
      if (body.industry !== undefined) updateData.industry = body.industry ? body.industry.trim() : null;
      if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl ? body.websiteUrl.trim() : null;
      if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;

      const result = await db.boothTenant.updateMany({
        where: { id: { in: ids } },
        data: updateData,
      });

      return NextResponse.json({ success: true, count: result.count, ids });
    }

    // 2. Single Booth Update
    const {
      id,
      companyName,
      boothNumber,
      hallName,
      industry,
      websiteUrl,
      description,
      dimensions,
      areaSqm,
      boothType,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booth ID for update" },
        { status: 400 }
      );
    }

    // Strict ownership on the parent event.
    const singleUpdateGate = await requireBoothWrites(request, [id], db);
    if (!singleUpdateGate.ok) {
      return NextResponse.json(
        { success: false, error: singleUpdateGate.error },
        { status: singleUpdateGate.status }
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

    const updateData: Record<string, unknown> = {};
    if (companyName !== undefined) updateData.companyName = companyName !== null ? companyName.trim() : "";
    if (boothNumber !== undefined) updateData.boothNumber = boothNumber.trim();
    if (hallName !== undefined) updateData.hallName = hallName.trim();
    if (industry !== undefined) updateData.industry = industry ? industry.trim() : null;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl ? websiteUrl.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (dimensions !== undefined) updateData.dimensions = dimensions ? dimensions.trim() : null;
    if (areaSqm !== undefined) updateData.areaSqm = areaSqm !== null && areaSqm !== "" ? parseFloat(String(areaSqm)) : null;
    if (boothType !== undefined) updateData.boothType = boothType ? boothType.trim() : null;

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
    let ids: string[] = [];

    const idsParam = searchParams.get("ids");
    if (idsParam) {
      ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    }

    try {
      const body = await request.json();
      if (body?.id) id = body.id;
      if (Array.isArray(body?.ids)) ids = body.ids;
    } catch {
      // Query param fallback
    }

    // 1. Bulk Decommission Path
    if (ids.length > 0) {
      // Strict ownership on every parent event before deleting anything.
      const bulkDeleteGate = await requireBoothWrites(request, ids, db);
      if (!bulkDeleteGate.ok) {
        return NextResponse.json(
          { success: false, error: bulkDeleteGate.error },
          { status: bulkDeleteGate.status }
        );
      }
      const result = await db.boothTenant.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, count: result.count, ids });
    }

    // 2. Single Decommission Path
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

    // Strict ownership on the parent event.
    const singleDeleteGate = await requireBoothWrites(request, [id], db);
    if (!singleDeleteGate.ok) {
      return NextResponse.json(
        { success: false, error: singleDeleteGate.error },
        { status: singleDeleteGate.status }
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
