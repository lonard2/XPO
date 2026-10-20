import { db } from "@/lib/db";
import { randomToken, sha256hex } from "./password";

export const SESSION_COOKIE = "xpo_session";
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function secureCookies(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Serialize the session cookie. HttpOnly always; Secure in production. */
export function sessionCookieHeader(token: string, maxAgeSec: number): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (secureCookies()) parts.push("Secure");
  return parts.join("; ");
}

/** Expired-session clearing header. */
export function clearedSessionCookieHeader(): string {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secureCookies()) parts.push("Secure");
  return parts.join("; ");
}

/** Mint a session and return the raw token (stored only as a hash). */
export async function createSession(
  userId: string,
  opts?: { userAgent?: string | null; ip?: string | null; ttlMs?: number }
): Promise<string> {
  const token = randomToken();
  const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS;
  await db.session.create({
    data: {
      tokenHash: sha256hex(token),
      userId,
      userAgent: opts?.userAgent?.slice(0, 300) || null,
      ip: opts?.ip?.slice(0, 80) || null,
      expiresAt: new Date(Date.now() + ttl),
    },
  });
  // Best-effort expiry sweep keeps the table bounded.
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
  return token;
}

export interface ResolvedSession {
  user: { id: string; email: string; name: string; role: string; organization: string | null };
}

/** Resolve a raw cookie token to its user, or null when missing/forged/expired. */
export async function resolveSession(token: string | null | undefined): Promise<ResolvedSession | null> {
  if (!token) return null;
  const row = await db.session.findUnique({
    where: { tokenHash: sha256hex(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, organization: true } } },
  });
  if (!row || row.expiresAt.getTime() <= Date.now()) {
    if (row) await db.session.delete({ where: { id: row.id } }).catch(() => {});
    return null;
  }
  return { user: row.user };
}

/** Revoke a session by raw token. Idempotent. */
export async function revokeSession(token: string | null | undefined): Promise<void> {
  if (!token) return;
  await db.session.delete({ where: { tokenHash: sha256hex(token) } }).catch(() => {});
}

/** Extract the raw session token from a cookie header. */
export function sessionTokenFromCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|; )xpo_session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Demo persona cookies resolve only when explicitly allowed (dev/test). */
export function allowDemoAuth(): boolean {
  const flag = process.env.ALLOW_DEMO_AUTH;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}
