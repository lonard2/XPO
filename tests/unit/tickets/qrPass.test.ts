import { describe, it, expect } from "vitest";
import * as crypto from "crypto";
import {
  generateTicketHash,
  verifyTicketHash,
  generateSvgQrCode,
  type TicketPassPayload,
} from "@/lib/tickets/qrPass";

describe("Phase 6 Unit: Cryptographic QR Pass & Anti-Tamper Engine", () => {
  const samplePayload: TicketPassPayload = {
    bookingId: "bk-mfg-2026-001",
    eventId: "ev-manufacturing-indonesia-2026",
    tierId: "tier-vip-delegate",
    attendeeEmail: "alex@xpo.com",
    issuedAt: Date.now(),
    nonce: "random-nonce-994827103",
  };

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 tests)
  // ==========================================================================

  it("T1.1: generates deterministic HMAC-SHA256 ticket pass payload and signature", () => {
    const res1 = generateTicketHash(samplePayload);
    const res2 = generateTicketHash(samplePayload);

    expect(res1.signature).toBeDefined();
    expect(res1.signature).toHaveLength(64); // 256-bit hex string
    expect(res1.signature).toBe(res2.signature);
    expect(res1.qrCodeHash).toBe(res2.qrCodeHash);
    expect(res1.qrCodeHash).toMatch(/^XPO-PASS-BK-MFG-2026-001-[A-F0-9]{16}$/);
  });

  it("T1.2: validates and verifies a validly signed ticket pass payload", () => {
    const { signature, payloadString } = generateTicketHash(samplePayload);
    const verifyResult = verifyTicketHash(payloadString, signature);

    expect(verifyResult.valid).toBe(true);
    expect(verifyResult.payload).toBeDefined();
    expect(verifyResult.payload?.bookingId).toBe(samplePayload.bookingId);
    expect(verifyResult.payload?.attendeeEmail).toBe("alex@xpo.com");
    expect(verifyResult.payload?.tierId).toBe("tier-vip-delegate");
    expect(verifyResult.error).toBeUndefined();
  });

  it("T1.3: verifies unique nonces generate distinct cryptographic signatures for identical attendees", () => {
    const payloadA: TicketPassPayload = { ...samplePayload, nonce: "nonce-aaa-111" };
    const payloadB: TicketPassPayload = { ...samplePayload, nonce: "nonce-bbb-222" };

    const resA = generateTicketHash(payloadA);
    const resB = generateTicketHash(payloadB);

    expect(resA.signature).not.toBe(resB.signature);
    expect(resA.qrCodeHash).not.toBe(resB.qrCodeHash);
  });

  it("T1.4: generates well-formed SVG XML with embedded verification metadata and corner targets", () => {
    const { qrCodeHash } = generateTicketHash(samplePayload);
    const svg = generateSvgQrCode(qrCodeHash, { size: 300, primaryColor: "#2563eb" });

    expect(svg).toContain("<svg");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 300 300"');
    expect(svg).toContain(`data-qr-encoded="${qrCodeHash}"`);
    expect(svg).toContain('fill="#2563eb"');
    expect(svg).toContain("</svg>");
  });

  it("T1.5: canonicalizes email casing and whitespace before hashing", () => {
    const payloadWithSpaces: TicketPassPayload = {
      ...samplePayload,
      attendeeEmail: "  ALEX@XPO.COM  ",
    };

    const resNormal = generateTicketHash(samplePayload);
    const resCleaned = generateTicketHash(payloadWithSpaces);

    expect(resNormal.signature).toBe(resCleaned.signature);
    expect(resNormal.qrCodeHash).toBe(resCleaned.qrCodeHash);
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & ADVERSARIAL EDGE CASES
  // ==========================================================================

  it("T2.1 (Security): rejects bit-flip privilege escalation attack (altering tier from STANDARD to VIP)", () => {
    const standardPayload: TicketPassPayload = {
      ...samplePayload,
      tierId: "tier-standard-pass",
    };

    const { signature, payloadString } = generateTicketHash(standardPayload);

    // Adversary attempts to tamper with payloadString to claim VIP tier
    const tamperedPayloadString = payloadString.replace("tier-standard-pass", "tier-vip-delegate");
    const result = verifyTicketHash(tamperedPayloadString, signature);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("INVALID_SIGNATURE");
  });

  it("T2.2 (Security): rejects truncated or malformed signatures", () => {
    const { signature, payloadString } = generateTicketHash(samplePayload);
    const truncatedSignature = signature.substring(0, 32); // Chopped in half

    const result = verifyTicketHash(payloadString, truncatedSignature);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("INVALID_SIGNATURE");
  });

  it("T2.3 (Security): rejects signature computed with invalid secret salt key", () => {
    const { signature, payloadString } = generateTicketHash(samplePayload, "rogue-unauthorized-key");
    const result = verifyTicketHash(payloadString, signature); // verifies with default server secret

    expect(result.valid).toBe(false);
    expect(result.error).toContain("INVALID_SIGNATURE");
  });

  it("T2.4 (Freshness): detects expired tickets when maxAgeMs window is exceeded", () => {
    const expiredTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 60; // 60 days ago
    const oldPayload: TicketPassPayload = {
      ...samplePayload,
      issuedAt: expiredTimestamp,
    };

    const { signature, payloadString } = generateTicketHash(oldPayload);
    const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;

    const result = verifyTicketHash(payloadString, signature, undefined, thirtyDaysMs);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("EXPIRED_TICKET");
  });

  it("T2.5 (Boundary): handles empty or malformed JSON payloads gracefully without crashing", () => {
    const res1 = verifyTicketHash("", "some-sig");
    expect(res1.valid).toBe(false);

    const res2 = verifyTicketHash("{ invalid json ", "some-sig");
    expect(res2.valid).toBe(false);

    const res3 = verifyTicketHash(JSON.stringify({ notATicket: true }), "a".repeat(64));
    expect(res3.valid).toBe(false);
  });
});
