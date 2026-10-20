import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { rateLimitResponse } from "@/lib/api/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/auth/register — public signup. Role is always ATTENDEE. */
export async function POST(request: Request) {
  const limited = rateLimitResponse("auth-register", request, { limit: 10, windowMs: 60 * 60_000 });
  if (limited) return limited;
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    let passwordHash: string;
    try {
      passwordHash = await hashPassword(password);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await db.user.create({
      data: { email, name, role: "ATTENDEE", passwordHash },
      select: { id: true, email: true, name: true, role: true, organization: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Registration failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
