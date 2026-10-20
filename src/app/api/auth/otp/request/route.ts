import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth/otp";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/otp/request — always resolves successfully so the
 * endpoint never reveals whether an address is registered.
 */
export async function POST(request: Request) {
  const limited = rateLimitResponse("auth-otp-request", request, { limit: 10, windowMs: 10 * 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const purpose = body.purpose === "VERIFY_EMAIL" ? "VERIFY_EMAIL" : "LOGIN";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    await requestOtp(email, purpose);
    return NextResponse.json({ success: true });
  } catch (error) {
    reportError("auth-otp-request", error);
    return NextResponse.json(
      { error: `OTP request failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
