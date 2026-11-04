import { reportWarn } from "@/lib/observability/logger";
import { apiError } from "@/lib/api/envelope";

export interface RateLimitRule {
  /** Max hits per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitVerdict {
  ok: boolean;
  retryAfterSec: number;
  /** Configured ceiling for this window. */
  limit: number;
  /** Requests left after this one. */
  remaining: number;
  /** Epoch seconds when the window resets. */
  resetAtSec: number;
}

export interface RateLimitStore {
  readonly name: string;
  hit(key: string, rule: RateLimitRule, now?: number): Promise<RateLimitVerdict>;
  reset?(): void;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/** Pure fixed-window step shared by the store and the sync test helper. */
function fixedWindow(
  bucket: Bucket | undefined,
  rule: RateLimitRule,
  now: number
): { verdict: RateLimitVerdict; bucket: Bucket } {
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    return {
      verdict: {
        ok: true,
        retryAfterSec: 0,
        limit: rule.limit,
        remaining: Math.max(0, rule.limit - 1),
        resetAtSec: Math.ceil(resetAt / 1000),
      },
      bucket: { count: 1, resetAt },
    };
  }
  if (bucket.count < rule.limit) {
    const count = bucket.count + 1;
    return {
      verdict: {
        ok: true,
        retryAfterSec: 0,
        limit: rule.limit,
        remaining: Math.max(0, rule.limit - count),
        resetAtSec: Math.ceil(bucket.resetAt / 1000),
      },
      bucket: { count, resetAt: bucket.resetAt },
    };
  }
  return {
    verdict: {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      limit: rule.limit,
      remaining: 0,
      resetAtSec: Math.ceil(bucket.resetAt / 1000),
    },
    bucket,
  };
}

/** Process-local fixed window. Correct alone; wrong across instances. */
class MemoryRateLimitStore implements RateLimitStore {
  readonly name = "memory";
  private buckets = new Map<string, Bucket>();

  async hit(key: string, rule: RateLimitRule, now = Date.now()): Promise<RateLimitVerdict> {
    return this.hitSync(key, rule, now);
  }

  hitSync(key: string, rule: RateLimitRule, now = Date.now()): RateLimitVerdict {
    const step = fixedWindow(this.buckets.get(key), rule, now);
    this.buckets.set(key, step.bucket);
    return step.verdict;
  }

  reset(): void {
    this.buckets.clear();
  }
}

const WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return {count, redis.call('PTTL', KEYS[1])}
`;

interface RedisCommands {
  eval(script: string, numKeys: number, ...args: Array<string | number>): Promise<unknown>;
  disconnect(): void;
}

/**
 * Shared fixed window over Redis/Valkey. Every instance sees the same
 * counters, so limits hold behind a load balancer. The client connects
 * lazily so importing this module never opens a socket at build time.
 */
export class RedisRateLimitStore implements RateLimitStore {
  readonly name = "redis";
  private client: RedisCommands | null = null;

  constructor(
    private readonly url: string,
    client?: RedisCommands
  ) {
    if (client) this.client = client;
  }

  private async commands(): Promise<RedisCommands> {
    if (!this.client) {
      const { default: Redis } = await import("ioredis");
      const client = new Redis(this.url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      }) as unknown as RedisCommands & { connect(): Promise<void> };
      await (client as unknown as { connect(): Promise<void> }).connect();
      this.client = client;
    }
    return this.client;
  }

  async hit(key: string, rule: RateLimitRule): Promise<RateLimitVerdict> {
    const redis = await this.commands();
    const result = (await redis.eval(
      WINDOW_SCRIPT,
      1,
      `ratelimit:${key}`,
      rule.windowMs,
      rule.limit
    )) as [number, number];
    const [count, rawTtl] = result;
    const ttlMs = rawTtl >= 0 ? rawTtl : rule.windowMs;
    const allowed = count <= rule.limit;
    return {
      ok: allowed,
      retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil(ttlMs / 1000)),
      limit: rule.limit,
      remaining: Math.max(0, rule.limit - count),
      resetAtSec: Math.ceil((Date.now() + ttlMs) / 1000),
    };
  }

  reset(): void {
    this.client?.disconnect();
    this.client = null;
  }
}

const memory = new MemoryRateLimitStore();

/**
 * The active store lives on globalThis, not module state. Next bundles each
 * route separately, so a module-level `let` would give every route its own
 * store and silently drop back to memory: the boot hook would configure one
 * instance while handlers read another. globalThis is shared across bundles
 * in one process (the same reason db.ts keeps Prisma there).
 */
const GLOBAL_KEY = "__xpo_rate_limit_store__";

function getActive(): RateLimitStore {
  const holder = globalThis as unknown as Record<string, RateLimitStore | undefined>;
  const existing = holder[GLOBAL_KEY];
  if (existing) return existing;
  const store: RateLimitStore = process.env.REDIS_URL
    ? new RedisRateLimitStore(process.env.REDIS_URL)
    : memory;
  holder[GLOBAL_KEY] = store;
  return store;
}

/** Swap the backing store. Used at server boot when REDIS_URL is set. */
export function configureRateLimitStore(store: RateLimitStore): void {
  (globalThis as unknown as Record<string, RateLimitStore>)[GLOBAL_KEY] = store;
}

export function activeRateLimitStore(): RateLimitStore {
  return getActive();
}

/** Test seam: drop all counters and return to the memory store. */
export function resetRateLimits(): void {
  memory.reset();
  (globalThis as unknown as Record<string, RateLimitStore>)[GLOBAL_KEY] = memory;
}

/**
 * In-memory fixed-window check with an injectable clock. Kept synchronous
 * for unit tests; route handlers must use rateLimitResponse instead so they
 * follow whichever store is active.
 */
export function checkRateLimit(
  key: string,
  rule: RateLimitRule,
  now = Date.now()
): { ok: boolean; retryAfterSec: number } {
  return memory.hitSync(key, rule, now);
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

export interface RateLimitOutcome {
  response: Response | null;
  /** Headers to attach to a successful response. Empty when the store failed open. */
  headers: Record<string, string>;
}

function limitHeaders(rule: RateLimitRule, verdict: RateLimitVerdict): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(rule.limit),
    "X-RateLimit-Remaining": String(verdict.remaining),
    "X-RateLimit-Reset": String(verdict.resetAtSec),
  };
}

/**
 * Check the limit and return both the blocking response (or null) and the
 * headers a handler should attach to its success response. Callers that only
 * need the gate can use rateLimitResponse.
 *
 * A store failure fails open: a downed cache must not take the site with it.
 * The miss is logged so a blind rate limiter does not stay blind.
 */
export async function enforceRateLimit(
  route: string,
  request: Request,
  rule: RateLimitRule
): Promise<RateLimitOutcome> {
  const active = getActive();
  let verdict: RateLimitVerdict;
  try {
    verdict = await active.hit(`${route}:${clientIp(request)}`, rule);
  } catch (error) {
    reportWarn("rate-limit", `store ${active.name} failed, allowing request`, {
      route,
      error: error instanceof Error ? error.message : String(error),
    });
    return { response: null, headers: {} };
  }
  const headers = limitHeaders(rule, verdict);
  if (verdict.ok) return { response: null, headers };
  return {
    response: apiError(
      "RATE_LIMITED: Too many requests. Back off and retry.",
      429,
      undefined,
      { headers: { ...headers, "Retry-After": String(verdict.retryAfterSec) } }
    ),
    headers,
  };
}

/**
 * 429 response honoring the active store's verdict, or null when allowed.
 * Kept as the gate-only entry point for handlers that do not surface
 * X-RateLimit headers.
 */
export async function rateLimitResponse(
  route: string,
  request: Request,
  rule: RateLimitRule
): Promise<Response | null> {
  return (await enforceRateLimit(route, request, rule)).response;
}
