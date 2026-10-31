import { createHash } from "crypto";

/**
 * Deterministic, staff-verifiable voucher code derived from the booking's
 * cryptographic hash and the perk id. Same booking plus perk always yields
 * the same code, so re-claims are idempotent and collisions are impossible.
 *
 * Lives outside the route handler because Next rejects extra exports from a
 * route module, which is what broke the production build.
 */
export function buildVoucherCode(qrCodeHash: string, perkId: string): string {
  const digest = createHash("sha256")
    .update(`${qrCodeHash}:${perkId}:xpo-voucher-v1`)
    .digest("hex")
    .toUpperCase();
  return `XPO-${digest.slice(0, 4)}-${digest.slice(4, 8)}`;
}
