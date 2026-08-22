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
    const body = await request.json();
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

    if (!eventId || !companyName || !boothNumber || !hallName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (eventId, companyName, boothNumber, hallName)" },
        { status: 400 }
      );
    }

    const booth = await db.boothTenant.create({
      data: {
        eventId,
        companyName,
        boothNumber,
        hallName,
        industry: industry || null,
        websiteUrl: websiteUrl || null,
        logoUrl: logoUrl || null,
        description: description || null,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, companyName, boothNumber, hallName, industry, websiteUrl, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booth ID for update" },
        { status: 400 }
      );
    }

    const updated = await db.boothTenant.update({
      where: { id },
      data: {
        companyName,
        boothNumber,
        hallName,
        industry: industry || null,
        websiteUrl: websiteUrl || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, booth: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to update booth: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
