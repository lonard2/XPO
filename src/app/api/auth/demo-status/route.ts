import { NextResponse } from "next/server";
import { allowDemoAuth } from "@/lib/auth/sessionStore";

/** GET /api/auth/demo-status — whether demo persona auth is enabled. */
export async function GET() {
  return NextResponse.json({ allowed: allowDemoAuth() });
}
