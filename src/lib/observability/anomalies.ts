import { db } from "@/lib/db";

export interface AnomalySignal {
  kind: "admission-spike" | "override-cluster" | "quiet-gate";
  eventId: string;
  eventTitle: string;
  /** Admissions stamped inside the last hour. */
  lastHour: number;
  /** Mean hourly admissions across the trailing window. */
  baselinePerHour: number;
  /** Supporting count (e.g. overrides in window). */
  supportingCount: number;
  detail: string;
}

const SPIKE_MIN_VOLUME = 5;
const SPIKE_RATIO = 3;
const OVERRIDE_CLUSTER_MIN = 2;

/**
 * Gate anomaly detection from persisted evidence only: admission
 * timestamps plus the audit trail. No heuristics over data we do not
 * store (verify failures are never persisted by design).
 */
export async function detectAnomalies(
  opts?: { hoursBack?: number }
): Promise<AnomalySignal[]> {
  const hoursBack = opts?.hoursBack ?? 24;
  const now = Date.now();
  const windowStart = new Date(now - hoursBack * 3600_000);
  const hourStart = new Date(now - 3600_000);
  const signals: AnomalySignal[] = [];

  const admissions = await db.booking.findMany({
    where: {
      status: "CHECKED_IN",
      checkedInAt: { gte: windowStart },
    },
    select: { eventId: true, checkedInAt: true, event: { select: { title: true } } },
  });
  const byEvent = new Map<string, { title: string; times: number[] }>();
  for (const a of admissions) {
    const slot = byEvent.get(a.eventId) || { title: a.event.title, times: [] };
    if (a.checkedInAt) slot.times.push(a.checkedInAt.getTime());
    byEvent.set(a.eventId, slot);
  }
  for (const [eventId, slot] of byEvent) {
    const lastHour = slot.times.filter((t) => t >= hourStart.getTime()).length;
    const baselinePerHour = slot.times.length / hoursBack;
    if (
      lastHour >= SPIKE_MIN_VOLUME &&
      (baselinePerHour === 0 || lastHour >= SPIKE_RATIO * baselinePerHour)
    ) {
      signals.push({
        kind: "admission-spike",
        eventId,
        eventTitle: slot.title,
        lastHour,
        baselinePerHour: Math.round(baselinePerHour * 100) / 100,
        supportingCount: slot.times.length,
        detail: `${lastHour} admissions in the last hour against a ${baselinePerHour.toFixed(2)}/h trailing baseline.`,
      });
    }
  }

  const overrides = await db.auditLog.findMany({
    where: { action: "pass.override", createdAt: { gte: windowStart } },
    select: { entityId: true },
  });
  if (overrides.length > 0) {
    const bookingIds = [...new Set(overrides.map((o) => o.entityId).filter(Boolean))] as string[];
    const owners = await db.booking.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, eventId: true, event: { select: { title: true } } },
    });
    const perEvent = new Map<string, { title: string; count: number }>();
    for (const o of owners) {
      const slot = perEvent.get(o.eventId) || { title: o.event.title, count: 0 };
      slot.count += 1;
      perEvent.set(o.eventId, slot);
    }
    for (const [eventId, slot] of perEvent) {
      if (slot.count >= OVERRIDE_CLUSTER_MIN) {
        signals.push({
          kind: "override-cluster",
          eventId,
          eventTitle: slot.title,
          lastHour: 0,
          baselinePerHour: 0,
          supportingCount: slot.count,
          detail: `${slot.count} supervisor overrides recorded inside the window.`,
        });
      }
    }
  }

  return signals;
}
