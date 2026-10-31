/**
 * Best-effort alerting to an external webhook (Slack-compatible `{ text }`).
 *
 * Alerts are deduplicated per key inside a cooldown window, because a failing
 * route can fire hundreds of times a minute and a pager that cries wolf gets
 * muted. Delivery is fire-and-forget: alerting must never fail the request that
 * triggered it.
 */

export interface AlertPayload {
  /** Dedupe key, usually the route or subsystem name. */
  key: string;
  title: string;
  message: string;
  severity?: "error" | "warn";
  context?: Record<string, unknown>;
}

const DEFAULT_COOLDOWN_MS = 15 * 60_000;

const lastSentAt = new Map<string, number>();

function cooldownMs(): number {
  const configured = Number(process.env.ALERT_COOLDOWN_MS);
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_COOLDOWN_MS;
}

export function alertingConfigured(): boolean {
  return Boolean(process.env.ALERT_WEBHOOK_URL);
}

/** Test seam: forget the dedupe window. */
export function resetAlertState(): void {
  lastSentAt.clear();
}

function formatText(payload: AlertPayload): string {
  const severity = payload.severity ?? "error";
  const context = payload.context
    ? `\n${Object.entries(payload.context)
        .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
        .join(" ")}`
    : "";
  return `[${severity}] ${payload.title}\n${payload.message}${context}`;
}

/**
 * Returns true when a message was actually posted, false when alerting is
 * unconfigured, throttled, or the webhook failed.
 */
export async function notifyAlert(payload: AlertPayload): Promise<boolean> {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return false;

  const now = Date.now();
  const previous = lastSentAt.get(payload.key);
  if (previous !== undefined && now - previous < cooldownMs()) return false;
  lastSentAt.set(payload.key, now);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: formatText(payload),
        ...payload,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
