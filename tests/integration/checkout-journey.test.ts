import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  generateTicketHash,
  verifyTicketHash,
  type TicketPassPayload,
} from "@/lib/tickets/qrPass";
import { formatCurrency } from "@/lib/i18n/formatters";

describe("Phase 6 Integration: Ticket Reservation, Pricing & QR Pass Issuance", () => {
  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    // Clean up test bookings created during run
    await db.booking.deleteMany({
      where: { attendeeEmail: { contains: "test-checkout" } },
    });
    await db.$disconnect();
  });

  it("T4.1 (MICE Journey): completes end-to-end ticket reservation, price calculation, and cryptographic pass generation", async () => {
    // 1. Fetch real event and tier from seeded database
    const event = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
      include: { ticketTiers: true, venue: true },
    });

    expect(event).toBeDefined();
    expect(event?.ticketTiers.length).toBeGreaterThan(0);

    const vipTier = event?.ticketTiers.find((t) => t.name.includes("VIP")) || event?.ticketTiers[0];
    expect(vipTier).toBeDefined();

    const user = await db.user.findFirst({
      where: { email: "alex@xpo.com" },
    });
    expect(user).toBeDefined();

    // 2. Format ticket price using i18n formatter
    const formattedPrice = formatCurrency(vipTier!.price, vipTier!.currency as any, "id");
    expect(formattedPrice).toContain("Rp");

    // 3. Generate cryptographic HMAC-SHA256 QR pass
    const bookingId = `bk-test-${Date.now()}`;
    const payload: TicketPassPayload = {
      bookingId,
      eventId: event!.id,
      tierId: vipTier!.id,
      attendeeEmail: "test-checkout-attendee@xpo.com",
      issuedAt: Date.now(),
      nonce: `nonce-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };

    const { qrCodeHash, signature, payloadString } = generateTicketHash(payload);
    expect(qrCodeHash).toContain(`XPO-PASS-${bookingId.toUpperCase()}`);

    // 4. Persist booking into database
    const initialSoldCount = vipTier!.soldCount;
    const booking = await db.booking.create({
      data: {
        id: bookingId,
        userId: user!.id,
        eventId: event!.id,
        ticketTierId: vipTier!.id,
        attendeeName: "Test Checkout Attendee",
        attendeeEmail: "test-checkout-attendee@xpo.com",
        qrCodeHash,
        status: "CONFIRMED",
      },
      include: {
        event: { include: { venue: true } },
        ticketTier: true,
        user: true,
      },
    });

    // 5. Update tier sold count
    await db.ticketTier.update({
      where: { id: vipTier!.id },
      data: { soldCount: { increment: 1 } },
    });

    // 6. Verify database record and cryptographic authenticity
    expect(booking.id).toBe(bookingId);
    expect(booking.status).toBe("CONFIRMED");
    expect(booking.event.venue.name).toContain("JIExpo Kemayoran");
    expect(booking.ticketTier.name).toBe(vipTier!.name);

    const verification = verifyTicketHash(payloadString, signature);
    expect(verification.valid).toBe(true);
    expect(verification.payload?.bookingId).toBe(bookingId);

    const updatedTier = await db.ticketTier.findUnique({
      where: { id: vipTier!.id },
    });
    expect(updatedTier?.soldCount).toBe(initialSoldCount + 1);
  });
});
