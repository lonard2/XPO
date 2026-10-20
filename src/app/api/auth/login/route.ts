import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  sessionCookieHeader,
  clearedSessionCookieHeader,
} from "@/lib/auth/sessionStore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/** POST /api/auth/login — password login with per-account lockout. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!EMAIL_RE.test(email) || !password) {
      // Flatten timing so unknown emails are indistinguishable.
      await verifyPassword("dummy-password-00!", "scrypt$00$00");
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await verifyPassword("dummy-password-00!", "scrypt$00$00");
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.lockedUntilAt && user.lockedUntilAt.getTime() > Date.now()) {
      const res = NextResponse.json(
        { error: "Account temporarily locked after repeated failures. Try again later." },
        { status: 423 }
      );
      res.headers.set("Set-Cookie", clearedSessionCookieHeader());
      return res;
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      const failures = user.failedLoginAttempts + 1;
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failures,
          lockedUntilAt: failures >= MAX_FAILURES ? new Date(Date.now() + LOCKOUT_MS) : null,
        },
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const [token] = await Promise.all([
      createSession(user.id, {
        userAgent: request.headers.get("user-agent"),
      }),
      db.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntilAt: null },
      }),
    ]);
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
      },
    });
    res.headers.set("Set-Cookie", sessionCookieHeader(token, 30 * 24 * 60 * 60));
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: `Login failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
