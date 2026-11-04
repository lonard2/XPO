import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildVoucherCode } from "@/lib/tickets/voucher";
import { apiError } from "@/lib/api/envelope";
import { readDeleteParams } from "@/lib/api/request";

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
      return apiError("Query parameter 'bookingId' is required.", 400);
    }
    const claims = await db.voucherClaim.findMany({
      where: { bookingId },
      include: { perk: { select: { id: true, title: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    return apiError(`Failed to list claims: ${(error as Error).message}`, 500);
  }
}

/** POST /api/perks/claim — claim a voucher (idempotent by booking + perk). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { bookingId, perkId } = body;
    if (!bookingId || !perkId) {
      return apiError("Missing required fields (bookingId, perkId).", 400);
    }

    const loaded = await loadBookingAndPerk(bookingId, perkId);
    if ("error" in loaded) {
      return apiError(loaded.error ?? "NOT_FOUND: booking or perk is missing.", loaded.status);
    }
    const { booking, perk } = loaded;

    const denial = checkEligibility(perk, booking);
    if (denial) {
      return apiError(denial, 403);
    }

    const code = buildVoucherCode(booking.qrCodeHash, perk.id);
    const claim = await db.voucherClaim.upsert({
      where: { bookingId_perkId: { bookingId, perkId } },
      create: { bookingId, perkId, code },
      update: {},
    });

    return NextResponse.json({ success: true, claim }, { status: 201 });
  } catch (error) {
    return apiError(`Failed to claim voucher: ${(error as Error).message}`, 500);
  }
}

/** DELETE /api/perks/claim — undo a claim (releases the voucher). */
export async function DELETE(request: Request) {
  try {
    // Query first, JSON body wins; an empty body keeps the query values.
    const { bookingId, perkId } = await readDeleteParams(request, ["bookingId", "perkId"]);
    if (!bookingId || !perkId) {
      return apiError("Missing required fields (bookingId, perkId).", 400);
    }

    await db.voucherClaim.deleteMany({ where: { bookingId, perkId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(`Failed to release voucher: ${(error as Error).message}`, 500);
  }
}
