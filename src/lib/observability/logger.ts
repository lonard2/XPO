/**
 * Structured server log lines for collectors. Single-line JSON on the
 * matching console channel: {ts, level, scope, message, ...context}.
 * Values are defensively serialized so logging never throws.
 */

function safeContext(context?: Record<string, unknown>): Record<string, unknown> {
  if (!context) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    try {
      out[key] =
        typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null
          ? value
          : JSON.stringify(value) ?? String(value);
    } catch {
      out[key] = "[unserializable]";
    }
  }
  return out;
}

function emit(
  channel: "error" | "warn",
  level: "error" | "warn",
  scope: string,
  message: string,
  context?: Record<string, unknown>
): void {
  let line: string;
  try {
    line = JSON.stringify({ ts: new Date().toISOString(), level, scope, message, ...safeContext(context) });
  } catch {
    line = JSON.stringify({ ts: new Date().toISOString(), level, scope, message: "[unserializable]" });
  }
  if (channel === "error") console.error(line);
  else console.warn(line);
}

/** Unexpected failure with a scope tag (route name) and safe context. */
export function reportError(scope: string, error: unknown, context?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  emit("error", "error", scope, message, context);
}

/** Suspicious-but-handled signal (rate hits, lockouts, mismatches). */
export function reportWarn(scope: string, message: string, context?: Record<string, unknown>): void {
  emit("warn", "warn", scope, message, context);
}
