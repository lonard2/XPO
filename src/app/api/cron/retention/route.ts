import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reportError } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

/**
 * GET /api/cron/retention — enforce the audit retention window.
 * Hosting-neutral: any scheduler calls this with CRON_SECRET.
 *
 * AUDIT_RETENTION_DAYS unset or invalid means dry-run: the response reports
 * what would be deleted and deletes nothing. Retention destroys evidence,
 * so the window is an explicit operator decision, never a default. See
 * docs/operations/privacy.md.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return apiError("Unauthorized: a valid CRON_SECRET is required.", 401);
  }

  try {
    const days = Number(process.env.AUDIT_RETENTION_DAYS);
    const configured = Number.isInteger(days) && days > 0;

    const cutoff = configured
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      : new Date();
    const wouldDelete = await db.auditLog.count({
      where: configured ? { createdAt: { lt: cutoff } } : {},
    });

    if (!configured) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        deleted: 0,
        wouldDelete,
        message: "AUDIT_RETENTION_DAYS is not set: nothing was deleted.",
      });
    }

    const deleted = await db.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    return NextResponse.json({
      success: true,
      dryRun: false,
      deleted: deleted.count,
      wouldDelete: wouldDelete,
      retentionDays: days,
    });
  } catch (error) {
    reportError("retention", error);
    return apiError("INTERNAL_ERROR: retention run failed.", 500);
  }
}
