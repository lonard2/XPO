export interface RateLimitRule {
  /** Max hits per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window rate limiter, keyed per route + client IP.
 * Correct for single-instance deploys (this app's compose topology);
 * a multi-instance rollout needs a shared store — see the module note.
 */
export function checkRateLimit(
  key: string,
  rule: RateLimitRule,
  now = Date.now()
): { ok: boolean; retryAfterSec: number } {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count < rule.limit) {
    bucket.count += 1;
    return { ok: true, retryAfterSec: 0 };
  }
  return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}

/** Test seam: drop all counters. */
export function resetRateLimits(): void {
  buckets.clear();
}

/** Client IP for keying: first forwarded address, then direct remote. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** 429 response honoring a limiter verdict, or null when allowed. */
export function rateLimitResponse(
  route: string,
  request: Request,
  rule: RateLimitRule
): Response | null {
  const verdict = checkRateLimit(`${route}:${clientIp(request)}`, rule);
  if (verdict.ok) return null;
  return Response.json(
    { error: "RATE_LIMITED: Too many requests. Back off and retry." },
    { status: 429, headers: { "Retry-After": String(verdict.retryAfterSec) } }
  );
}
