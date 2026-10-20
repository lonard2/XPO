import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession, sessionCookieHeader } from "@/lib/auth/sessionStore";
import { rateLimitResponse } from "@/lib/api/rateLimit";

/** POST /api/auth/otp/verify — exchange a code for a session. */
export async function POST(request: Request) {
  const limited = rateLimitResponse("auth-otp-verify", request, { limit: 30, windowMs: 10 * 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const code = typeof body.code === "string" ? body.code : "";
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }
    const result = await verifyOtp(email, code, "LOGIN");
    if (!result.ok || !result.userId) {
      return NextResponse.json({ error: result.error || "Invalid or expired code." }, { status: result.status });
    }
    const token = await createSession(result.userId, {
      userAgent: request.headers.get("user-agent"),
    });
    const user = await db.user.findUnique({
      where: { id: result.userId },
      select: { id: true, email: true, name: true, role: true, organization: true },
    });
    const res = NextResponse.json({ user });
    res.headers.set("Set-Cookie", sessionCookieHeader(token, 30 * 24 * 60 * 60));
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: `OTP verification failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
