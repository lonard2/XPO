import { NextResponse } from "next/server";
import { resolveSession, sessionTokenFromCookie } from "@/lib/auth/sessionStore";
import { apiError } from "@/lib/api/envelope";

export async function GET(request: Request) {
  const session = await resolveSession(
    sessionTokenFromCookie(request.headers.get("cookie"))
  );
  if (!session) {
    return apiError("UNAUTHENTICATED", 401);
  }
  return NextResponse.json({ user: session.user });
}
