import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

/**
 * Deterministic, staff-verifiable voucher code derived from the booking's
 * cryptographic hash and the perk id. Same booking plus perk always yields
 * the same code, so re-claims are idempotent and collisions are impossible.
 */
export function buildVoucherCode(qrCodeHash: string, perkId: string): string {
  const digest = createHash("sha256")
    .update(`${qrCodeHash}:${perkId}:xpo-voucher-v1`)
    .digest("hex")
    .toUpperCase();
  return `XPO-${digest.slice(0, 4)}-${digest.slice(4, 8)}`;
}

/** Legacy name-label rule, kept for perks without an exact tierId gate. */
function legacyNameEligible(tierRequired: string, tierName: string): boolean {
  const req = tierRequired.toLowerCase().trim();
  const userTier = tierName.toLowerCase().trim();
  if (req === "vip" || req.includes("vip")) {
    return (
      userTier.includes("vip") ||
      userTier.includes("delegate") ||
      userTier.includes("executive") ||
      userTier.includes("exhibitor")
    );
  }
  return userTier.includes(req);
}

async function loadBookingAndPerk(bookingId: string, perkId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { ticketTier: true },
  });
  if (!booking) return { error: "Booking not found.", status: 404 } as const;
  const perk = await db.eventPerk.findUnique({ where: { id: perkId } });
  if (!perk) return { error: "Perk not found.", status: 404 } as const;
  return { booking, perk };
}

function checkEligibility(
  perk: { tierId: string | null; tierRequired: string | null },
  booking: { ticketTierId: string; ticketTier: { name: string } }
): string | null {
  if (perk.tierId) {
    return booking.ticketTierId === perk.tierId
      ? null
      : "Forbidden: This perk is locked to another pass tier.";
  }
  if (perk.tierRequired && !legacyNameEligible(perk.tierRequired, booking.ticketTier.name)) {
    return "Forbidden: This perk is locked to another pass tier.";
  }
  return null;
}

/** GET /api/perks/claim?bookingId= — server record of claimed vouchers. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'bookingId' is required." },
        { status: 400 }
      );
    }
    const claims = await db.voucherClaim.findMany({
      where: { bookingId },
      include: { perk: { select: { id: true, title: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to list claims: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/** POST /api/perks/claim — claim a voucher (idempotent by booking + perk). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { bookingId, perkId } = body;
    if (!bookingId || !perkId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (bookingId, perkId)." },
        { status: 400 }
      );
    }

    const loaded = await loadBookingAndPerk(bookingId, perkId);
    if ("error" in loaded) {
      return NextResponse.json(
        { success: false, error: loaded.error },
        { status: loaded.status }
      );
    }
    const { booking, perk } = loaded;

    const denial = checkEligibility(perk, booking);
    if (denial) {
      return NextResponse.json({ success: false, error: denial }, { status: 403 });
    }

    const code = buildVoucherCode(booking.qrCodeHash, perk.id);
    const claim = await db.voucherClaim.upsert({
      where: { bookingId_perkId: { bookingId, perkId } },
      create: { bookingId, perkId, code },
      update: {},
    });

    return NextResponse.json({ success: true, claim }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to claim voucher: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/** DELETE /api/perks/claim — undo a claim (releases the voucher). */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { bookingId, perkId } = body;
    if ((!bookingId || !perkId) && request.url.includes("?")) {
      const params = new URL(request.url).searchParams;
      bookingId = bookingId || params.get("bookingId") || undefined;
      perkId = perkId || params.get("perkId") || undefined;
    }
    if (!bookingId || !perkId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (bookingId, perkId)." },
        { status: 400 }
      );
    }

    await db.voucherClaim.deleteMany({ where: { bookingId, perkId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to release voucher: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
