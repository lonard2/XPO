import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError } from "@/lib/api/envelope";
import { idOrSlugWhere } from "@/lib/api/request";
import {
  resolveEventCaller,
  canWriteEvent,
} from "@/lib/auth/eventOwnership";
import { UPDATE_TITLE_MAX, UPDATE_BODY_MAX } from "@/lib/news/validation";
import { revertUpdateToDraft } from "@/lib/news/slots";

interface RouteParams {
  params: Promise<{ id: string; updateId: string }>;
}

const EditSchema = z.object({
  title: z.string().trim().min(1).max(UPDATE_TITLE_MAX).optional(),
  body: z.string().trim().min(1).max(UPDATE_BODY_MAX).optional(),
});

async function ownedUpdate(id: string, updateId: string, req: Request) {
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
  const row = await db.eventUpdate.findFirst({
    where: { id: updateId, eventId: existing.id },
  });
  if (!row) return { error: apiError(`Update not found: ${updateId}`, 404) as Response };
  return { row };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id, updateId } = await params;
    const gate = await ownedUpdate(id, updateId, request);
    if (gate.error) return gate.error;

    const body = await request.json().catch(() => ({}));
    if (body.status !== undefined || body.approved !== undefined) {
      return apiError("Bad Request: approval is editorial-only and cannot be set here.", 400);
    }
    const parsed = EditSchema.safeParse(body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return apiError("Bad Request: title and/or body are required.", 400);
    }

    // Copy edits to approved rows revert to draft for re-approval, and the
    // revert evicts any homepage slot in the same transaction.
    const reverting = gate.row!.status === "APPROVED";
    const updated = reverting
      ? await revertUpdateToDraft(gate.row!.id, parsed.data)
      : await db.eventUpdate.update({
          where: { id: gate.row!.id },
          data: parsed.data,
        });
    return NextResponse.json({ success: true, update: updated });
  } catch (error) {
    return apiError(`Failed to edit event update: ${(error as Error).message}`, 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id, updateId } = await params;
    const gate = await ownedUpdate(id, updateId, request);
    if (gate.error) return gate.error;

    // Homepage slots cascade from the relation: no dead rail cards.
    await db.eventUpdate.delete({ where: { id: gate.row!.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(`Failed to delete event update: ${(error as Error).message}`, 500);
  }
}
