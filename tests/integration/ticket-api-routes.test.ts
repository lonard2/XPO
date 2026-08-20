import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { POST as checkoutRoute } from "@/app/api/tickets/checkout/route";
import { POST as verifyRoute, GET as getVerifyRoute } from "@/app/api/tickets/verify/route";

describe("Phase 6 Integration: Ticket Checkout & Verification API Routes", () => {
  let testEvent: any;
  let testTier: any;

  beforeAll(async () => {
    await db.$connect();
    testEvent = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
      include: { ticketTiers: true },
    });
    testTier = testEvent?.ticketTiers[0];
  });

  afterAll(async () => {
    await db.booking.deleteMany({
      where: { attendeeEmail: { contains: "api-route-test" } },
    });
    await db.$disconnect();
  });

  it("Checkout Route: rejects request with missing fields (400)", async () => {
    const req = new Request("http://localhost:3000/api/tickets/checkout", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        // missing tierId and attendee details
      }),
    });

    const res = await checkoutRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("VALIDATION_ERROR");
  });

  it("Checkout Route: rejects request for non-existent tier (404)", async () => {
    const req = new Request("http://localhost:3000/api/tickets/checkout", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        tierId: "non-existent-tier-id",
        attendeeName: "Test User",
        attendeeEmail: "api-route-test-404@xpo.com",
      }),
    });

    const res = await checkoutRoute(req);
    expect(res.status).toBe(404);
  });

  it("Checkout Route: successfully creates booking, generates HMAC pass, and updates soldCount (201)", async () => {
    const initialSoldCount = testTier.soldCount;

    const req = new Request("http://localhost:3000/api/tickets/checkout", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        tierId: testTier.id,
        attendeeName: "API Route Tester",
        attendeeEmail: "api-route-test-attendee@xpo.com",
        quantity: 1,
      }),
    });

    const res = await checkoutRoute(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.booking).toBeDefined();
    expect(json.booking.id).toMatch(/^bk-/);
    expect(json.booking.qrCodeHash).toContain(`XPO-PASS-${json.booking.id.toUpperCase()}`);
    expect(json.booking.signature).toBeDefined();
    expect(json.booking.svgQr).toContain("<svg");
    expect(json.booking.status).toBe("CONFIRMED");

    // Verify DB update
    const updatedTier = await db.ticketTier.findUnique({
      where: { id: testTier.id },
    });
    expect(updatedTier?.soldCount).toBe(initialSoldCount + 1);

    // Save for verify test
    const bookingId = json.booking.id;
    const qrCodeHash = json.booking.qrCodeHash;
    const signature = json.booking.signature;
    const payloadString = json.booking.payloadString;

    // Verify Route POST
    const verifyReq = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      body: JSON.stringify({
        qrCodeHash,
        payloadString,
        signature,
        autoCheckIn: true,
      }),
    });

    const verifyRes = await verifyRoute(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.valid).toBe(true);
    expect(verifyJson.status).toBe("CHECKED_IN");
    expect(verifyJson.alreadyCheckedIn).toBe(false);

    // Double Check-In detection
    const doubleScanReq = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      body: JSON.stringify({
        qrCodeHash,
      }),
    });

    const doubleScanRes = await verifyRoute(doubleScanReq);
    expect(doubleScanRes.status).toBe(200);
    const doubleScanJson = await doubleScanRes.json();
    expect(doubleScanJson.valid).toBe(true);
    expect(doubleScanJson.alreadyCheckedIn).toBe(true);
    expect(doubleScanJson.message).toContain("DOUBLE_SCAN");

    // Verify Route GET
    const getReq = new Request(`http://localhost:3000/api/tickets/verify?qrCodeHash=${encodeURIComponent(qrCodeHash)}`);
    const getRes = await getVerifyRoute(getReq);
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.valid).toBe(true);
    expect(getJson.attendee.name).toBe("API Route Tester");
  });

  it("Verify Route: rejects tampered cryptographic payload (400)", async () => {
    const req = new Request("http://localhost:3000/api/tickets/verify", {
      method: "POST",
      body: JSON.stringify({
        payloadString: JSON.stringify({ bookingId: "bk-hacked", attendeeEmail: "hacker@xpo.com" }),
        signature: "a".repeat(64),
      }),
    });

    const res = await verifyRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.error).toContain("INVALID_SIGNATURE");
  });
});
