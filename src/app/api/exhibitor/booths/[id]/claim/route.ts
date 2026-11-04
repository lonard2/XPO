import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canWriteEvent } from "@/lib/auth/eventOwnership";
import { audit } from "@/lib/observability/audit";
import { apiError } from "@/lib/api/envelope";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const DECISIONS = ["CLAIMED", "REJECTED"] as const;

/**
 * POST /api/exhibitor/booths/[id]/claim — ask to own a booth.
 * Idempotent for the same claimant; another pending or approved claim wins.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const booth = await db.boothTenant.findUnique({
      where: { id },
      select: { id: true, eventId: true, userId: true, claimStatus: true },
    });
    if (!booth) {
      return apiError("NOT_FOUND: booth does not exist.", 404);
    }

    if (booth.claimStatus === "CLAIMED" || booth.claimStatus === "PENDING") {
      if (booth.userId === gate.caller.userId) {
        return NextResponse.json({
          success: true,
          booth: { id: booth.id, claimStatus: booth.claimStatus },
        });
      }
      return apiError("CONFLICT: this booth is already claimed or under review.", 409);
    }

    const updated = await db.boothTenant.update({
      where: { id },
      data: { userId: gate.caller.userId, claimStatus: "PENDING", claimedAt: null },
      select: { id: true, claimStatus: true },
    });

    await audit(request, {
      action: "booth.claim",
      entity: "BoothTenant",
      entityId: id,
      metadata: { eventId: booth.eventId },
    });

    return NextResponse.json({ success: true, booth: updated }, { status: 201 });
  } catch {
    return apiError("INTERNAL_ERROR: could not claim the booth.", 500);
  }
}

/**
 * PATCH /api/exhibitor/booths/[id]/claim — organizer approves or rejects.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const status = typeof body.status === "string" ? body.status.toUpperCase() : "";
    if (!(DECISIONS as readonly string[]).includes(status)) {
      return apiError("VALIDATION_ERROR: status must be CLAIMED or REJECTED.", 400);
    }

    const booth = await db.boothTenant.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });
    if (!booth) {
      return apiError("NOT_FOUND: booth does not exist.", 404);
    }
    if (!canWriteEvent(gate.caller, booth.event.organizerId)) {
      return apiError("Forbidden: only the owning organizer can decide a claim.", 403);
    }

    if (status === "CLAIMED" && !booth.userId) {
      return apiError("CONFLICT: no exhibitor is waiting on this booth.", 409);
    }

    const updated = await db.boothTenant.update({
      where: { id },
      data:
        status === "CLAIMED"
          ? { claimStatus: "CLAIMED", claimedAt: new Date() }
          : { claimStatus: "REJECTED", userId: null, claimedAt: null },
      select: { id: true, claimStatus: true, userId: true },
    });

    await audit(request, {
      action: status === "CLAIMED" ? "booth.claim.approve" : "booth.claim.reject",
      entity: "BoothTenant",
      entityId: id,
      metadata: { eventId: booth.eventId },
    });

    return NextResponse.json({ success: true, booth: updated });
  } catch {
    return apiError("INTERNAL_ERROR: could not decide the claim.", 500);
  }
}

/**
 * DELETE /api/exhibitor/booths/[id]/claim — withdraw a pending claim.
 * An approved booth needs the organizer to reject it first.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const booth = await db.boothTenant.findUnique({
      where: { id },
      select: { id: true, userId: true, claimStatus: true },
    });
    if (!booth) {
      return apiError("NOT_FOUND: booth does not exist.", 404);
    }
    if (booth.userId !== gate.caller.userId && gate.caller.role !== "ADMIN") {
      return apiError("Forbidden: only the claimant can withdraw.", 403);
    }
    if (booth.claimStatus === "CLAIMED") {
      return apiError("CONFLICT: an approved booth needs the organizer to release it.", 409);
    }

    await db.boothTenant.update({
      where: { id },
      data: { claimStatus: "UNCLAIMED", userId: null, claimedAt: null },
    });

    return NextResponse.json({ success: true, booth: { id, claimStatus: "UNCLAIMED" } });
  } catch {
    return apiError("INTERNAL_ERROR: could not withdraw the claim.", 500);
  }
}
