import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";

const MAX_MESSAGE = 500;
const MAX_STACK = 2000;
const MAX_URL = 300;

/**
 * POST /api/telemetry/error — browser error reports.
 *
 * Accepts a bounded message, stack and path, then routes them through the same
 * logger and alert webhook as server errors. Always answers 204 so a failing
 * reporter cannot loop or surface an error to the user.
 */
export async function POST(request: Request) {
  const limited = await rateLimitResponse("telemetry-error", request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  if (!message) return new NextResponse(null, { status: 204 });

  reportError("client", new Error(message), {
    stack: typeof body.stack === "string" ? body.stack.slice(0, MAX_STACK) : undefined,
    url: typeof body.url === "string" ? body.url.slice(0, MAX_URL) : undefined,
  });

  return new NextResponse(null, { status: 204 });
}
