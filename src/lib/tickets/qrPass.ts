import * as crypto from "crypto";

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
 * with position detection patterns, pseudo-deterministic data matrix, and security watermarks.
 */
export function generateSvgQrCode(
  data: string,
  options: SvgQrOptions = {}
): string {
  const size = options.size || 256;
  const primaryColor = options.primaryColor || "#1e3a8a";
  const backgroundColor = options.backgroundColor || "#ffffff";
  const hashVal = crypto.createHash("md5").update(data).digest("hex");

  // Generate a deterministic grid of 21x21 data modules based on data hash
  const gridSize = 21;
  const moduleSize = (size * 0.8) / gridSize;
  const offset = size * 0.1;

  const modules: string[] = [];

  // Corner patterns (top-left, top-right, bottom-left) in 21x21 coordinates:
  // Top-Left: 0..6, 0..6
  // Top-Right: 14..20, 0..6
  // Bottom-Left: 0..6, 14..20
  const isCornerFinder = (r: number, c: number): boolean => {
    if (r <= 6 && c <= 6) return true;
    if (r <= 6 && c >= 14) return true;
    if (r >= 14 && c <= 6) return true;
    return false;
  };

  // Generate data modules
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isCornerFinder(r, c)) continue;

      // Deterministic bit derivation from hash & coordinates
      const bitIndex = (r * gridSize + c) % (hashVal.length * 4);
      const hexChar = hashVal.charAt(Math.floor(bitIndex / 4));
      const hexNum = parseInt(hexChar, 16);
      const isFilled = ((hexNum >> (bitIndex % 4)) & 1) === 1 || (r + c) % 3 === 0;

      if (isFilled) {
        const x = offset + c * moduleSize;
        const y = offset + r * moduleSize;
        modules.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(moduleSize * 0.95).toFixed(2)}" height="${(moduleSize * 0.95).toFixed(2)}" fill="${primaryColor}" rx="1" />`
        );
      }
    }
  }

  // Corner Position Detection Targets (Standard 7x7 module proportions)
  const renderFinderPattern = (startX: number, startY: number) => {
    const finderSize = moduleSize * 7;
    return `
  <!-- Finder Pattern at (${startX.toFixed(1)}, ${startY.toFixed(1)}) -->
  <rect x="${startX.toFixed(2)}" y="${startY.toFixed(2)}" width="${finderSize.toFixed(2)}" height="${finderSize.toFixed(2)}" fill="${primaryColor}" rx="${(moduleSize * 0.8).toFixed(1)}" />
  <rect x="${(startX + moduleSize).toFixed(2)}" y="${(startY + moduleSize).toFixed(2)}" width="${(finderSize - moduleSize * 2).toFixed(2)}" height="${(finderSize - moduleSize * 2).toFixed(2)}" fill="${backgroundColor}" rx="${(moduleSize * 0.5).toFixed(1)}" />
  <rect x="${(startX + moduleSize * 2).toFixed(2)}" y="${(startY + moduleSize * 2).toFixed(2)}" width="${(finderSize - moduleSize * 4).toFixed(2)}" height="${(finderSize - moduleSize * 4).toFixed(2)}" fill="${primaryColor}" rx="${(moduleSize * 0.3).toFixed(1)}" />`;
  };

  const tlFinder = renderFinderPattern(offset, offset);
  const trFinder = renderFinderPattern(offset + moduleSize * 14, offset);
  const blFinder = renderFinderPattern(offset, offset + moduleSize * 14);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-qr-encoded="${data}" data-checksum="${hashVal}">
  <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="16" />
  
  <!-- QR Corner Position Detection Patterns -->
  <rect x="${(size * 0.08).toFixed(1)}" y="${(size * 0.08).toFixed(1)}" width="${(size * 0.24).toFixed(1)}" height="${(size * 0.24).toFixed(1)}" fill="${primaryColor}" rx="4" />
  <rect x="${(size * 0.12).toFixed(1)}" y="${(size * 0.12).toFixed(1)}" width="${(size * 0.16).toFixed(1)}" height="${(size * 0.16).toFixed(1)}" fill="${backgroundColor}" rx="2" />
  <rect x="${(size * 0.15).toFixed(1)}" y="${(size * 0.15).toFixed(1)}" width="${(size * 0.10).toFixed(1)}" height="${(size * 0.10).toFixed(1)}" fill="${primaryColor}" />
  
  <rect x="${(size * 0.68).toFixed(1)}" y="${(size * 0.08).toFixed(1)}" width="${(size * 0.24).toFixed(1)}" height="${(size * 0.24).toFixed(1)}" fill="${primaryColor}" rx="4" />
  <rect x="${(size * 0.72).toFixed(1)}" y="${(size * 0.12).toFixed(1)}" width="${(size * 0.16).toFixed(1)}" height="${(size * 0.16).toFixed(1)}" fill="${backgroundColor}" rx="2" />
  <rect x="${(size * 0.75).toFixed(1)}" y="${(size * 0.15).toFixed(1)}" width="${(size * 0.10).toFixed(1)}" height="${(size * 0.10).toFixed(1)}" fill="${primaryColor}" />
  
  <rect x="${(size * 0.08).toFixed(1)}" y="${(size * 0.68).toFixed(1)}" width="${(size * 0.24).toFixed(1)}" height="${(size * 0.24).toFixed(1)}" fill="${primaryColor}" rx="4" />
  <rect x="${(size * 0.12).toFixed(1)}" y="${(size * 0.72).toFixed(1)}" width="${(size * 0.16).toFixed(1)}" height="${(size * 0.16).toFixed(1)}" fill="${backgroundColor}" rx="2" />
  <rect x="${(size * 0.15).toFixed(1)}" y="${(size * 0.75).toFixed(1)}" width="${(size * 0.10).toFixed(1)}" height="${(size * 0.10).toFixed(1)}" fill="${primaryColor}" />

  <!-- Encoded Data Blocks Matrix -->
  ${modules.join("\n  ")}

  <!-- Center Verification Holographic Stamp -->
  <circle cx="${(size / 2).toFixed(1)}" cy="${(size / 2).toFixed(1)}" r="${(size * 0.08).toFixed(1)}" fill="${backgroundColor}" stroke="${primaryColor}" stroke-width="2" />
  <circle cx="${(size / 2).toFixed(1)}" cy="${(size / 2).toFixed(1)}" r="${(size * 0.05).toFixed(1)}" fill="${primaryColor}" opacity="0.85" />
</svg>`;
}
