import { db } from "@/lib/db";
import { resolveEventCaller } from "@/lib/auth/eventOwnership";
import { clientIp } from "@/lib/api/rateLimit";
import { reportError } from "@/lib/observability/logger";

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Best-effort audit write. Resolves the actor from the request (session
 * first, demo fallback per flag) and never throws — observability must
 * not break the mutation it records.
 */
export async function audit(
  req: Request | null | undefined,
  entry: AuditEntry
): Promise<void> {
  try {
    if (!entry || !entry.action || !entry.entity) return;
    let actorId: string | null = null;
    let actorRole: string | null = null;
    let ip: string | null = null;
    if (req) {
      const caller = await resolveEventCaller(req);
      actorId = caller.userId;
      actorRole = caller.role;
      ip = clientIp(req);
    }
    await db.auditLog.create({
      data: {
        actorId,
        actorRole,
        action: entry.action.slice(0, 80),
        entity: entry.entity.slice(0, 40),
        entityId: entry.entityId?.slice(0, 120) || null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata).slice(0, 4000) : null,
        ip: ip === "unknown" ? null : ip,
      },
    });
  } catch (error) {
    reportError("audit", error);
  }
}

/** Newest-first entries for the admin feed. */
export async function recentAuditEntries(limit = 50) {
  const take = Math.max(1, Math.min(limit, 200));
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
}
