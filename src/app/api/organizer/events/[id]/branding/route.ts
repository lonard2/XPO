import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveEventCaller, canWriteEvent } from "@/lib/auth/eventOwnership";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { brandingConfig, title, heroImageUrl } = body;

    const existing = await db.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Event not found for ID: ${id}` },
        { status: 404 }
      );
    }

    // Strict ownership: ADMIN may brand anything; organizers only their own
    // events; platform-curated events are admin-only.
    const caller = await resolveEventCaller(request);
    if (!canWriteEvent(caller, existing.organizerId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only the owning organizer or a platform administrator can update this event's branding." },
        { status: 403 }
      );
    }

    const updated = await db.event.update({
      where: { id: existing.id },
      data: {
        ...(title ? { title } : {}),
        ...(heroImageUrl ? { heroImageUrl } : {}),
        brandingConfigJson: typeof brandingConfig === "string"
          ? brandingConfig
          : JSON.stringify(brandingConfig || {}),
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to update branding: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
