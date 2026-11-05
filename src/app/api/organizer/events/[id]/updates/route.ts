import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";
import {
  resolveEventCaller,
  canWriteEvent,
} from "@/lib/auth/eventOwnership";
import { EventUpdateInput } from "@/lib/news/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function ownedEvent(id: string, req: Request) {
  const existing = await db.event.findFirst({
    where: { ...idOrSlugWhere(id) },
    select: { id: true, organizerId: true },
  });
  if (!existing) return { error: apiError(`Event not found for ID: ${id}`, 404) as Response };
  const caller = await resolveEventCaller(req);
  if (!canWriteEvent(caller, existing.organizerId)) {
    return {
      error: apiError(
        "Forbidden: Only the owning organizer or a platform administrator can manage event updates.",
        403
      ) as Response,
    };
  }
  return { event: existing, caller };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const gate = await ownedEvent(id, request);
    if (gate.error) return gate.error;

    const updates = await db.eventUpdate.findMany({
      where: { eventId: gate.event!.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, updates });
  } catch (error) {
    return apiError(`Failed to list event updates: ${(error as Error).message}`, 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const gate = await ownedEvent(id, request);
    if (gate.error) return gate.error;

    const body = await request.json().catch(() => ({}));
    const parsed = EventUpdateInput.safeParse(body);
    if (!parsed.success) {
      return apiError("Bad Request: title (1-120) and body (1-500) are required.", 400);
    }

    const created = await db.eventUpdate.create({
      data: {
        eventId: gate.event!.id,
        authorId: gate.caller!.userId,
        title: parsed.data.title,
        body: parsed.data.body,
        status: "DRAFT",
      },
    });
    return NextResponse.json({ success: true, update: created });
  } catch (error) {
    return apiError(`Failed to create event update: ${(error as Error).message}`, 500);
  }
}
