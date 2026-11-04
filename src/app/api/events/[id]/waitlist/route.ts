import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { apiError } from "@/lib/api/envelope";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/events/[id]/waitlist — join a sold-out tier's queue.
 *
 * Public by design: a delegate who cannot buy a pass should not need an
 * account to ask for one. Joining is idempotent per tier and email.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const limited = await rateLimitResponse("waitlist-join", request, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { id: eventId } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const tierId = typeof body.tierId === "string" ? body.tierId : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME) : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!tierId) {
      return apiError("VALIDATION_ERROR: tierId is required.", 400);
    }
    if (!name) {
      return apiError("VALIDATION_ERROR: name is required.", 400);
    }
    if (!EMAIL_RE.test(email)) {
      return apiError("VALIDATION_ERROR: a valid email is required.", 400);
    }

    const event = await db.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      return apiError("NOT_FOUND: event does not exist.", 404);
    }

    const tier = await db.ticketTier.findFirst({
      where: { id: tierId, eventId },
      select: { id: true, capacity: true, soldCount: true },
    });
    if (!tier) {
      return apiError("NOT_FOUND: ticket tier does not belong to this event.", 404);
    }
    if (tier.soldCount < tier.capacity) {
      return apiError("SEATS_AVAILABLE: this tier still has seats. Book directly.", 409);
    }

    const existing = await db.waitlistEntry.findUnique({
      where: { ticketTierId_email: { ticketTierId: tierId, email } },
    });
    if (existing?.status === "PROMOTED") {
      return apiError("ALREADY_PROMOTED: a seat was already offered to this email.", 409);
    }

    const entry = existing
      ? await db.waitlistEntry.update({
          where: { id: existing.id },
          data: { name, status: "PENDING", promotedAt: null },
        })
      : await db.waitlistEntry.create({
          data: { eventId, ticketTierId: tierId, name, email },
        });

    const position =
      (await db.waitlistEntry.count({
        where: {
          ticketTierId: tierId,
          status: "PENDING",
          createdAt: { lte: entry.createdAt },
        },
      })) || 1;

    return NextResponse.json(
      { success: true, entry: { id: entry.id, status: entry.status }, position },
      { status: 201 }
    );
  } catch {
    return apiError("INTERNAL_ERROR: could not join the waitlist.", 500);
  }
}

/**
 * DELETE /api/events/[id]/waitlist?tierId=...&email=... — leave the queue.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get("tierId") || "";
    const email = (searchParams.get("email") || "").toLowerCase().trim();

    if (!tierId || !EMAIL_RE.test(email)) {
      return apiError("VALIDATION_ERROR: tierId and a valid email are required.", 400);
    }

    const result = await db.waitlistEntry.updateMany({
      where: { eventId, ticketTierId: tierId, email, status: "PENDING" },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true, removed: result.count });
  } catch {
    return apiError("INTERNAL_ERROR: could not leave the waitlist.", 500);
  }
}
