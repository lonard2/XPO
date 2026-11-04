import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

/**
 * DELETE /api/email/suppressions — remove an address from suppression.
 * ADMIN only. The operator path for "my mail stopped arriving": verify the
 * address is valid again, then lift the suppression explicitly.
 */
export async function DELETE(request: Request) {
  const gate = await requireUser(request, ["ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("VALIDATION_ERROR: a valid email is required.", 400);
    }

    const result = await db.emailSuppression.deleteMany({ where: { email } });

    await audit(request, {
      action: "email.unsuppress",
      entity: "EmailSuppression",
      entityId: email,
      metadata: { removed: result.count },
    });

    return NextResponse.json({ success: true, removed: result.count });
  } catch (error) {
    reportError("email-suppressions", error);
    return apiError("INTERNAL_ERROR: could not lift the suppression.", 500);
  }
}
