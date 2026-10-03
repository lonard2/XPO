import * as crypto from "crypto";
import QRCode from "qrcode";

export interface TicketPassPayload {
  bookingId: string;
  eventId: string;
  tierId: string;
  attendeeEmail: string;
  issuedAt: number;
  nonce: string;
}

export interface TicketHashResult {
  qrCodeHash: string;
  signature: string;
  payloadString: string;
}

export interface TicketVerifyResult {
  valid: boolean;
  payload?: TicketPassPayload;
  error?: string;
}

export interface SvgQrOptions {
  size?: number;
  primaryColor?: string;
  backgroundColor?: string;
  watermarkText?: string;
  status?: string;
}

export const DEFAULT_HMAC_SECRET =
  process.env.QR_HMAC_SECRET || "xpo-mice-secure-ticket-salt-2026-production-key";

/**
 * Deterministically generates an HMAC-SHA256 signed ticket pass payload and hash.
 * Follows strict canonicalization (sorted keys, lowercase/trimmed email, trimmed IDs).
 */
export function generateTicketHash(
  payload: TicketPassPayload,
  secret: string = DEFAULT_HMAC_SECRET
): TicketHashResult {
  const canonicalPayload = {
    attendeeEmail: payload.attendeeEmail.toLowerCase().trim(),
    bookingId: payload.bookingId.trim(),
    eventId: payload.eventId.trim(),
    issuedAt: payload.issuedAt,
    nonce: payload.nonce.trim(),
    tierId: payload.tierId.trim(),
  };

  const payloadString = JSON.stringify(canonicalPayload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");

  const qrCodeHash = `XPO-PASS-${payload.bookingId.toUpperCase()}-${signature
    .substring(0, 16)
    .toUpperCase()}`;

  return { qrCodeHash, signature, payloadString };
}

/**
 * Validates HMAC-SHA256 signature against payload string with constant-time equality check.
 * Protects against timing attacks, bit-flipping, privilege escalation, and expired tickets.
 */
export function verifyTicketHash(
  payloadString: string,
  signature: string,
  secret: string = DEFAULT_HMAC_SECRET,
  maxAgeMs?: number
): TicketVerifyResult {
  try {
    if (!payloadString || !signature) {
      return { valid: false, error: "Missing payload string or signature" };
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return {
        valid: false,
        error: "INVALID_SIGNATURE: Hash signature tampering detected",
      };
    }

    const parsed = JSON.parse(payloadString) as TicketPassPayload;

    if (
      !parsed.bookingId ||
      !parsed.eventId ||
      !parsed.tierId ||
      !parsed.attendeeEmail ||
      typeof parsed.issuedAt !== "number" ||
      !parsed.nonce
    ) {
      return {
        valid: false,
        error: "MALFORMED_PAYLOAD: Missing mandatory ticket metadata fields",
      };
    }

    if (maxAgeMs && Date.now() - parsed.issuedAt > maxAgeMs) {
      return {
        valid: false,
        error: "EXPIRED_TICKET: Pass timestamp exceeded maximum validity window",
        payload: parsed,
      };
    }

    return { valid: true, payload: parsed };
  } catch (err) {
    return { valid: false, error: `PARSE_ERROR: ${(err as Error).message}` };
  }
}

/**
 * Generates an SVG XML string representing a high-contrast vector QR Pass code
 * compliant with ISO/IEC 18004 standard (Reed-Solomon Error Correction Level M)
 * with authentic finder patterns, timing tracks, and verification metadata.
 */
export function generateSvgQrCode(
  data: string,
  options: SvgQrOptions = {}
): string {
  const size = options.size || 256;
  const primaryColor = options.primaryColor || "#1e3a8a";
  const backgroundColor = options.backgroundColor || "#ffffff";
  const hashVal = crypto.createHash("md5").update(data).digest("hex");

  try {
    const qr = QRCode.create(data, { errorCorrectionLevel: "M" });
    const moduleCount = qr.modules.size;
    const margin = 2;
    const totalGrid = moduleCount + margin * 2;
    const moduleSize = size / totalGrid;

    const modules: string[] = [];

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          const x = (c + margin) * moduleSize;
          const y = (r + margin) * moduleSize;
          modules.push(
            `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="${primaryColor}" />`
          );
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-qr-encoded="${data}" data-checksum="${hashVal}">
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="16" />

  <!-- ISO/IEC 18004 Standard QR Matrix Modules -->
  ${modules.join("\n  ")}

  <!-- Center Verification Holographic Stamp -->
  <circle cx="${(size / 2).toFixed(1)}" cy="${(size / 2).toFixed(1)}" r="${(size * 0.05).toFixed(1)}" fill="${backgroundColor}" stroke="${primaryColor}" stroke-width="1.5" />
  <circle cx="${(size / 2).toFixed(1)}" cy="${(size / 2).toFixed(1)}" r="${(size * 0.03).toFixed(1)}" fill="${primaryColor}" opacity="0.9" />
</svg>`;
  } catch (err) {
    console.error("Failed to generate standard QR code:", err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-qr-encoded="${data}" data-checksum="${hashVal}">
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="16" />
</svg>`;
  }
}
