import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/auth/register — public signup. Role is always ATTENDEE. */
export async function POST(request: Request) {
  const limited = await rateLimitResponse("auth-register", request, { limit: 10, windowMs: 60 * 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name) {
      return apiError("Name is required.", 400);
    }
    if (!EMAIL_RE.test(email)) {
      return apiError("A valid email address is required.", 400);
    }
    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
    } catch (err) {
      return apiError((err as Error).message, 400);
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("An account with this email already exists.", 409);
    }

    const user = await db.user.create({
      data: { email, name, role: "ATTENDEE", passwordHash },
      select: { id: true, email: true, name: true, role: true, organization: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    reportError("auth-register", error);
    return apiError(`Registration failed: ${(error as Error).message}`, 500);
  }
}
