import { NextResponse } from "next/server";
import { resolveSession, sessionTokenFromCookie } from "@/lib/auth/sessionStore";

export async function GET(request: Request) {
  const session = await resolveSession(
    sessionTokenFromCookie(request.headers.get("cookie"))
  );
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}
