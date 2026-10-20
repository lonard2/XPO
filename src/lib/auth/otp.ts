import { randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { sha256hex } from "./password";
import { deliverOtp } from "./otpProvider";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Issue a login code. Unknown emails still resolve successfully so the
 * endpoint never reveals whether an address is registered.
 */
export async function requestOtp(email: string, purpose = "LOGIN"): Promise<void> {
  const user = await db.user.findUnique({ where: { email } });
  await db.otpCode.updateMany({
    where: { email, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  const code = newCode();
  await db.otpCode.create({
    data: {
      email,
      codeHash: sha256hex(`${purpose}:${email}:${code}`),
      purpose,
      maxAttempts: OTP_MAX_ATTEMPTS,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      userId: user?.id || null,
    },
  });
  // Inbox ownership is the identity proof for new addresses, so every
  // request delivers. The API response stays generic either way.
  await deliverOtp(email, code, purpose);
}

export interface OtpVerification {
  ok: boolean;
  status: number;
  error?: string;
  userId?: string;
}

/** Verify a code. Consumes on success; counts attempts to lockout. */
export async function verifyOtp(
  email: string,
  code: string,
  purpose = "LOGIN"
): Promise<OtpVerification> {
  const normalized = code.trim();
  const row = await db.otpCode.findFirst({
    where: { email, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt.getTime() <= Date.now()) {
    return { ok: false, status: 401, error: "Invalid or expired code." };
  }
  if (row.attempts >= row.maxAttempts) {
    return { ok: false, status: 423, error: "Too many attempts. Request a fresh code." };
  }
  if (sha256hex(`${purpose}:${email}:${normalized}`) !== row.codeHash) {
    await db.otpCode.update({ where: { id: row.id }, data: { attempts: row.attempts + 1 } });
    const locked = row.attempts + 1 > row.maxAttempts;
    return locked
      ? { ok: false, status: 423, error: "Too many attempts. Request a fresh code." }
      : { ok: false, status: 401, error: "Invalid or expired code." };
  }
  await db.otpCode.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });

  let userId = row.userId;
  if (!userId) {
    const created = await db.user.create({
      data: { email, name: email.split("@")[0], role: "ATTENDEE", emailVerifiedAt: new Date() },
    });
    userId = created.id;
  } else {
    await db.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    }).catch(() => {});
  }
  return { ok: true, status: 200, userId };
}
