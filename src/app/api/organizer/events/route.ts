import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const events = await db.event.findMany({
      include: {
        ticketTiers: true,
        booths: true,
        venue: true,
        venueHall: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch events: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // RBAC Authorization Check
    const cookieHeader = request.headers.get("cookie") || "";
    const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
    const userRole = roleMatch ? decodeURIComponent(roleMatch[1]) : request.headers.get("x-xpo-user-role");

    if (userRole === "ATTENDEE") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Attendee role is not authorized to create exhibitions. Switch to Organizer or Admin persona." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      tagline,
      description,
      archetype = "INDUSTRIAL_B2B",
      format = "IN_PERSON",
      scale = "LARGE",
      regionId = "id",
      venueId,
      venueHallId,
      startDate,
      endDate,
      ticketTiers = [],
      primaryColor,
      accentColor,
      heroImageUrl,
    } = body;

    if (!title || !description || !venueId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Missing mandatory fields (title, description, venueId, startDate, endDate)" },
        { status: 400 }
      );
    }

    // Auto-generate unique slug if not provided
    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const uniqueSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;

    // Resolve an organizer user from DB or default to first organizer
    const organizer = await db.user.findFirst({
      where: { role: "ORGANIZER" },
    }) || await db.user.findFirst();

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "No organizer account found in database" },
        { status: 500 }
      );
    }

    const brandingConfig = {
      primaryColor: primaryColor || undefined,
      accentColor: accentColor || undefined,
    };

    const newEvent = await db.event.create({
      data: {
        title,
        slug: uniqueSlug,
        tagline: tagline || null,
        description,
        archetype,
        format,
        scale,
        regionId,
        venueId,
        venueHallId: venueHallId || null,
        organizerId: organizer.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        heroImageUrl: heroImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
        brandingConfigJson: JSON.stringify(brandingConfig),
        ticketTiers: {
          create: ticketTiers.length > 0
            ? ticketTiers.map((t: any) => ({
                name: t.name || "General Pass",
                price: Number(t.price) || 0,
                currency: t.currency || "IDR",
                capacity: Number(t.capacity) || 500,
                benefitsJson: JSON.stringify(t.benefits || ["General Admission Access"]),
              }))
            : [
                {
                  name: "Standard Delegate Pass",
                  price: 0,
                  currency: "IDR",
                  capacity: 1000,
                  benefitsJson: JSON.stringify(["Floor Access", "Standard Keynotes"]),
                },
                {
                  name: "VIP Executive Pass",
                  price: 500000,
                  currency: "IDR",
                  capacity: 150,
                  benefitsJson: JSON.stringify(["Fast Track QR Check-In", "VIP Lounge & Barista", "Speaker Slide Deck Access"]),
                },
              ],
        },
      },
      include: {
        ticketTiers: true,
        venue: true,
        venueHall: true,
      },
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to create event: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
