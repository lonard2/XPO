import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateShowcase } from "@/lib/showcase";

export async function GET() {
  try {
    const events = await db.event.findMany({
      include: {
        ticketTiers: true,
        booths: true,
        venue: { include: { halls: { select: { id: true, name: true, capacity: true } } } },
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
      venueHallIds,
      startDate,
      endDate,
      ticketTiers = [],
      primaryColor,
      accentColor,
      heroImageUrl,
      isPlatformCurated,
      organizerName,
      organizerId,
      isListingOnly,
      showcaseJson,
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

    // Resolve organizer or platform curation attributes based on role
    let finalOrganizerId: string | null = null;
    let finalIsPlatformCurated = false;
    let finalOrganizerName: string | null = null;

    if (userRole === "ADMIN") {
      if (!organizerId || isPlatformCurated === true) {
        finalOrganizerId = null;
        finalIsPlatformCurated = true;
        finalOrganizerName = organizerName || "XPO Platform Administration";
      } else {
        const targetOrganizer = await db.user.findUnique({ where: { id: organizerId } });
        finalOrganizerId = targetOrganizer ? targetOrganizer.id : organizerId;
        finalIsPlatformCurated = false;
        finalOrganizerName = organizerName || targetOrganizer?.organization || targetOrganizer?.name || null;
      }
    } else {
      let authUser: { id?: string; email?: string } | null = null;
      const userCookieMatch = cookieHeader.match(/xpo_auth_user=([^;]+)/);
      if (userCookieMatch) {
        try {
          authUser = JSON.parse(decodeURIComponent(userCookieMatch[1]));
        } catch {
          // Ignore cookie parsing error
        }
      }

      const headerUserId = request.headers.get("x-xpo-user-id") || authUser?.id;
      const headerUserEmail = request.headers.get("x-xpo-user-email") || authUser?.email;

      let organizer = null;
      if (headerUserId) {
        organizer = await db.user.findUnique({ where: { id: headerUserId } });
      }
      if (!organizer && headerUserEmail) {
        organizer = await db.user.findUnique({ where: { email: headerUserEmail } });
      }
      if (!organizer && organizerId) {
        organizer = await db.user.findUnique({ where: { id: organizerId } });
      }
      if (!organizer) {
        organizer = await db.user.findFirst({
          where: { role: "ORGANIZER" },
        }) || await db.user.findFirst();
      }

      if (!organizer) {
        return NextResponse.json(
          { success: false, error: "No organizer account found in database" },
          { status: 500 }
        );
      }

      finalOrganizerId = organizer.id;
      finalIsPlatformCurated = false;
      finalOrganizerName = organizerName || organizer.organization || organizer.name;
    }

    const brandingConfig = {
      primaryColor: primaryColor || undefined,
      accentColor: accentColor || undefined,
    };

    // Optional showcase content at creation time; invalid content is dropped,
    // never stored. Absent means showcase sections stay hidden.
    let initialShowcase: string | null = null;
    if (showcaseJson !== undefined && showcaseJson !== null) {
      const checked = validateShowcase(showcaseJson);
      if (checked.ok) {
        initialShowcase = JSON.stringify({
          ...checked.data,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Multi-hall allocation: persist every allocated hall, never just the
    // first. IDs outside this venue are dropped; the primary relation stays
    // the first valid hall so existing single-hall reads keep working.
    const requestedHallIds = Array.isArray(venueHallIds)
      ? [...new Set(venueHallIds.filter((h: any) => typeof h === "string" && h.length > 0))]
      : [];
    let allocatedHallIds: string[] = [];
    if (requestedHallIds.length > 0 && venueId) {
      const venueHalls = await db.venueHall.findMany({
        where: { id: { in: requestedHallIds }, venueId },
        select: { id: true },
      });
      const validSet = new Set(venueHalls.map((h) => h.id));
      allocatedHallIds = requestedHallIds.filter((id) => validSet.has(id));
    }
    const primaryHallId = allocatedHallIds[0] || venueHallId || null;

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
        venueHallId: primaryHallId,
        venueHallIds: allocatedHallIds.length > 0 ? JSON.stringify(allocatedHallIds) : null,
        organizerId: finalOrganizerId,
        organizerName: finalOrganizerName,
        isPlatformCurated: finalIsPlatformCurated,
        // Listings are admin-only: fully customizable, excluded from operations.
        isListingOnly: userRole === "ADMIN" && isListingOnly === true,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        heroImageUrl: heroImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
        brandingConfigJson: JSON.stringify(brandingConfig),
        showcaseJson: initialShowcase,
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
