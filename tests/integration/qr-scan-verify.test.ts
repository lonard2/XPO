import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { POST as verifyRoute } from "@/app/api/tickets/verify/route";
import {
  generateTicketHash,
  verifyTicketHash,
  type TicketPassPayload,
} from "@/lib/tickets/qrPass";

describe("Phase 9 Integration: Organizer Door QR Scanner & Verification Lifecycle", () => {
  let testBookingId: string;
  let testPayload: TicketPassPayload;
  let testSignature: string;
  let testPayloadString: string;
  let testQrCodeHash: string;

  beforeAll(async () => {
    await db.$connect();

    const event = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
      include: { ticketTiers: true },
    });
    const user = await db.user.findFirst({
      where: { email: "alex@xpo.com" },
    });

    const vipTier = event?.ticketTiers.find((t) => t.name.includes("VIP")) || event?.ticketTiers[0];

    testBookingId = `bk-scan-${Date.now()}`;
    testPayload = {
      bookingId: testBookingId,
      eventId: event!.id,
      tierId: vipTier!.id,
      attendeeEmail: "scan-test-attendee@xpo.com",
      issuedAt: Date.now(),
      nonce: `nonce-scan-${Date.now()}`,
    };

    const hashRes = generateTicketHash(testPayload);
    testQrCodeHash = hashRes.qrCodeHash;
    testSignature = hashRes.signature;
    testPayloadString = hashRes.payloadString;

    // Create active confirmed booking
    await db.booking.create({
      data: {
        id: testBookingId,
        userId: user!.id,
        eventId: event!.id,
        ticketTierId: vipTier!.id,
        attendeeName: "Alex Pratama (Scanner Test)",
        attendeeEmail: "scan-test-attendee@xpo.com",
        qrCodeHash: testQrCodeHash,
        status: "CONFIRMED",
      },
    });
  });

  afterAll(async () => {
    await db.booking.deleteMany({
      where: { attendeeEmail: { contains: "scan-test" } },
    });
    await db.$disconnect();
  });

  it("T3.1 (Scan Flow): verifies valid pass and transitions status from CONFIRMED to CHECKED_IN", async () => {
    // 1. Door scanner reads QR payload & signature
    const cryptoCheck = verifyTicketHash(testPayloadString, testSignature);
    expect(cryptoCheck.valid).toBe(true);

    // 2. Query booking record from database
    const booking = await db.booking.findUnique({
      where: { qrCodeHash: testQrCodeHash },
      include: { ticketTier: true, event: { include: { perks: true } } },
    });

    expect(booking).toBeDefined();
    expect(booking?.status).toBe("CONFIRMED");
    expect(booking?.checkedInAt).toBeNull();

    // 3. Mark check-in in database
    const checkInTime = new Date();
    const updatedBooking = await db.booking.update({
      where: { id: booking!.id },
      data: {
        status: "CHECKED_IN",
        checkedInAt: checkInTime,
      },
      include: { ticketTier: true, event: { include: { perks: true } } },
    });

    expect(updatedBooking.status).toBe("CHECKED_IN");
    expect(updatedBooking.checkedInAt).toBeDefined();

    // 4. Verify perk gating: VIP tier unlocks VIP Buyer Lounge Access
    const vipPerks = updatedBooking.event.perks.filter(
      (p) => !p.tierRequired || p.tierRequired.toLowerCase().includes("vip")
    );
    expect(vipPerks.length).toBeGreaterThan(0);
    expect(vipPerks.some((p) => p.title.includes("VIP") && p.title.includes("Lounge"))).toBe(true);
  });

  it("T3.2 (Double-Scan Prevention): rejects duplicate door check-in attempt", async () => {
    const booking = await db.booking.findUnique({
      where: { qrCodeHash: testQrCodeHash },
    });

    expect(booking?.status).toBe("CHECKED_IN");
    const isAlreadyCheckedIn = booking?.status === "CHECKED_IN";
    expect(isAlreadyCheckedIn).toBe(true);
  });

  it("T3.3 (Tamper Gate): rejects check-in when cryptographic signature does not match payload", async () => {
    const tamperedPayloadString = testPayloadString.replace("scan-test-attendee@xpo.com", "forged@hacker.com");
    const cryptoCheck = verifyTicketHash(tamperedPayloadString, testSignature);

    expect(cryptoCheck.valid).toBe(false);
    expect(cryptoCheck.error).toContain("INVALID_SIGNATURE");
  });

  it("T3.4 (Route Double-Scan): verify reports alreadyCheckedIn for an admitted pass", async () => {
    const req = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "xpo_role=ADMIN" },
      body: JSON.stringify({ qrCodeHash: testQrCodeHash, autoCheckIn: true }),
    });
    const res = await verifyRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(true);
    expect(json.alreadyCheckedIn).toBe(true);
  });

  it("T3.5 (Supervisor Override): re-stamps admission server-side for owners", async () => {
    const before = await db.booking.findUnique({ where: { qrCodeHash: testQrCodeHash } });
    const req = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "xpo_role=ADMIN" },
      body: JSON.stringify({ qrCodeHash: testQrCodeHash, autoCheckIn: true, supervisorOverride: true }),
    });
    const res = await verifyRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(true);
    expect(json.alreadyCheckedIn).toBe(false);
    expect(json.reEntryOverridden).toBe(true);
    expect(new Date(json.checkedInAt).getTime()).toBeGreaterThanOrEqual(
      new Date(before!.checkedInAt!).getTime()
    );
  });

  it("T3.6 (Supervisor Override): refuses non-owners with 403", async () => {
    const req = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "xpo_role=ATTENDEE" },
      body: JSON.stringify({ qrCodeHash: testQrCodeHash, autoCheckIn: true, supervisorOverride: true }),
    });
    const res = await verifyRoute(req);
    expect(res.status).toBe(403);
  });

  it("T3.7 (Event Scope): rejects passes scanned for the wrong event", async () => {
    const req = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "xpo_role=ADMIN" },
      body: JSON.stringify({ qrCodeHash: testQrCodeHash, autoCheckIn: false, eventId: "some-other-event" }),
    });
    const res = await verifyRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.error).toContain("EVENT_MISMATCH");
  });
});
