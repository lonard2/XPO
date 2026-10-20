import { NextResponse } from "next/server";
import {
  revokeSession,
  sessionTokenFromCookie,
  clearedSessionCookieHeader,
} from "@/lib/auth/sessionStore";

export async function POST(request: Request) {
  await revokeSession(sessionTokenFromCookie(request.headers.get("cookie")));
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", clearedSessionCookieHeader());
  return res;
}
