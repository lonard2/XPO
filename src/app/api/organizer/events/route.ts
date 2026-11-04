import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateShowcase } from "@/lib/showcase";
import { audit } from "@/lib/observability/audit";
import { parsePagination } from "@/lib/api/pagination";
import { enforceRateLimit } from "@/lib/api/rateLimit";
import { requireUser } from "@/lib/auth/guards";

/** Only http(s) URLs are stored; anything else is dropped, never echoed. */
function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
    if (gate.response) return gate.response;

    const { searchParams } = new URL(request.url);
    const { take, skip } = parsePagination(searchParams);
    // Organizers see only the events they own; admins see the platform.
    const where =
      gate.caller.role === "ADMIN" ? {} : { organizerId: gate.caller.userId as string };
    const [total, events] = await db.$transaction([
      db.event.count({ where }),
      db.event.findMany({
        where,
        include: {
          ticketTiers: true,
          booths: true,
          venue: { include: { halls: { select: { id: true, name: true, capacity: true } } } },
          venueHall: true,
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
    ]);

    return NextResponse.json({ success: true, events, total, take, skip });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch events: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const limit = await enforceRateLimit("organizer-events-post", request, {
      limit: 30,
      windowMs: 60_000,
    });
    if (limit.response) return limit.response;

    // Deny by default: a missing identity is 401, not an implicit pass.
    const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
    if (gate.response) return gate.response;
    const userRole = gate.caller.role as "ORGANIZER" | "ADMIN";

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
      externalUrl,
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
      // Ownership is the caller's own id. Never fall back to an arbitrary
      // organizer row: that attributed anonymous events to the first user.
      const organizer = await db.user.findUnique({
        where: { id: gate.caller.userId as string },
        select: { id: true, name: true, organization: true },
      });
      if (!organizer) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: organizer account no longer exists." },
          { status: 401 }
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
        externalUrl:
          userRole === "ADMIN" && isListingOnly === true ? safeExternalUrl(externalUrl) : null,
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
                meetingQuota:
                  Number.isInteger(Number(t.meetingQuota)) && Number(t.meetingQuota) >= 0
                    ? Number(t.meetingQuota)
                    : 0,
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

    await audit(request, { action: "event.create", entity: "event", entityId: newEvent.id, metadata: { title, isListingOnly: newEvent.isListingOnly } });
    return NextResponse.json(
      { success: true, event: newEvent },
      { status: 201, headers: limit.headers }
    );
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to create event: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
