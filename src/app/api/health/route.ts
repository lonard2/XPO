import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import pkg from "@/../package.json";

const BOOTED_AT = Date.now();

/** GET /api/health — liveness with database latency. Unauthenticated. */
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      uptimeSec: Math.round((Date.now() - BOOTED_AT) / 1000),
      version: (pkg as { version?: string }).version || "unknown",
      db: "ok",
      dbLatencyMs: Date.now() - started,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        uptimeSec: Math.round((Date.now() - BOOTED_AT) / 1000),
        version: (pkg as { version?: string }).version || "unknown",
        db: "error",
        error: (error as Error).message,
      },
      { status: 503 }
    );
  }
}
