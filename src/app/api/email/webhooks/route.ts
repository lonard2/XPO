import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

const BOUNCE_TYPES: Record<string, string> = {
  "email.bounced": "HARDBOUNCE",
  "email.complained": "COMPLAINT",
};

/**
 * Verify a Svix signature the way Resend sends it: HMAC-SHA256 over
 * `id.timestamp.body` with the base64 secret, compared in constant time.
 * Returns false on any malformed input instead of throwing.
 */
export function verifyWebhookSignature(
  secret: string,
  id: string,
  timestamp: string,
  body: string,
  signatureHeader: string
): boolean {
  try {
    const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
    const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
    const provided = signatureHeader
      .split(" ")
      .map((part) => part.replace(/^v1,/, ""))
      .filter(Boolean);
    return provided.some((candidate) => {
      const bytes = Buffer.from(candidate, "base64");
      return bytes.length === expected.length && timingSafeEqual(bytes, expected);
    });
  } catch {
    return false;
  }
}

/**
 * POST /api/email/webhooks — Resend bounce and complaint ingestion.
 * Suppressed addresses stop receiving non-OTP mail; OTP always sends.
 *
 * Authenticated by Svix signature when RESEND_WEBHOOK_SECRET is set, which
 * production requires: an open endpoint would let anyone suppress anyone
 * else's notifications. Without the secret, production refuses and
 * development accepts (documented in operations/email.md).
 */
export async function POST(request: Request) {
  const limited = await rateLimitResponse("email-webhooks", request, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET || "";
    const raw = await request.text();

    if (secret) {
      const id = request.headers.get("svix-id") || "";
      const timestamp = request.headers.get("svix-timestamp") || "";
      const signature = request.headers.get("svix-signature") || "";
      if (!verifyWebhookSignature(secret, id, timestamp, raw, signature)) {
        return apiError("Unauthorized: invalid webhook signature.", 401);
      }
    } else if (process.env.NODE_ENV === "production") {
      return apiError(
        "INTERNAL_ERROR: email webhooks are not configured (RESEND_WEBHOOK_SECRET).",
        503
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return apiError("VALIDATION_ERROR: webhook body must be JSON.", 400);
    }

    const type = typeof body.type === "string" ? body.type : "";
    const reason = BOUNCE_TYPES[type];
    if (!reason) {
      return NextResponse.json({ success: true, ignored: type || "unknown" });
    }

    const data = (body.data ?? {}) as Record<string, unknown>;
    const recipients = Array.isArray(data.to) ? data.to : [];
    const emails = [
      ...new Set(
        recipients
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.toLowerCase().trim())
          .filter(Boolean)
      ),
    ];
    if (emails.length === 0) {
      return apiError("VALIDATION_ERROR: webhook event carries no recipients.", 400);
    }

    await db.$transaction(
      emails.map((email) =>
        db.emailSuppression.upsert({
          where: { email },
          create: { email, reason, source: "resend-webhook" },
          // A complaint outranks an old bounce and vice versa: the latest
          // provider signal describes the address best.
          update: { reason, source: "resend-webhook" },
        })
      )
    );

    await audit(request, {
      action: "email.suppress",
      entity: "EmailSuppression",
      entityId: emails.join(","),
      metadata: { reason, count: emails.length },
    });

    return NextResponse.json({ success: true, suppressed: emails });
  } catch (error) {
    reportError("email-webhooks", error);
    return apiError("INTERNAL_ERROR: could not ingest the webhook event.", 500);
  }
}
