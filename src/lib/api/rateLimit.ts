import { reportWarn } from "@/lib/observability/logger";

export interface RateLimitRule {
  /** Max hits per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitVerdict {
  ok: boolean;
  retryAfterSec: number;
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
    return { verdict: { ok: true, retryAfterSec: 0 }, bucket: { count: 1, resetAt: now + rule.windowMs } };
  }
  if (bucket.count < rule.limit) {
    return {
      verdict: { ok: true, retryAfterSec: 0 },
      bucket: { count: bucket.count + 1, resetAt: bucket.resetAt },
    };
  }
  return {
    verdict: { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) },
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
if count > tonumber(ARGV[2]) then
  return {0, redis.call('PTTL', KEYS[1])}
end
return {1, 0}
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
    const [allowed, ttlMs] = result;
    if (allowed === 1) return { ok: true, retryAfterSec: 0 };
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(ttlMs / 1000)) };
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

/**
 * 429 response honoring the active store's verdict, or null when allowed.
 * A store failure fails open: a downed cache must not take the site with it.
 * The miss is logged so a blind rate limiter does not stay blind.
 */
export async function rateLimitResponse(
  route: string,
  request: Request,
  rule: RateLimitRule
): Promise<Response | null> {
  let verdict: RateLimitVerdict;
  const active = getActive();
  try {
    verdict = await active.hit(`${route}:${clientIp(request)}`, rule);
  } catch (error) {
    reportWarn("rate-limit", `store ${active.name} failed, allowing request`, {
      route,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
  if (verdict.ok) return null;
  return Response.json(
    { error: "RATE_LIMITED: Too many requests. Back off and retry." },
    { status: 429, headers: { "Retry-After": String(verdict.retryAfterSec) } }
  );
}
