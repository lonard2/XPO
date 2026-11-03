import { describe, it, expect, beforeEach } from "vitest";
import {
  RedisRateLimitStore,
  configureRateLimitStore,
  activeRateLimitStore,
  resetRateLimits,
  rateLimitResponse,
  enforceRateLimit,
} from "@/lib/api/rateLimit";

/** Deterministic stand-in for a Redis server. */
function fakeRedis() {
  const data = new Map<string, { count: number; ttlMs: number; deadline: number }>();
  let now = 0;
  return {
    setNow(value: number) {
      now = value;
    },
    async eval(_script: string, _numKeys: number, ...args: Array<string | number>) {
      const [key, windowMs, limit] = args as [string, number, number];
      let entry = data.get(key);
      if (!entry || entry.deadline <= now) {
        entry = { count: 0, ttlMs: windowMs, deadline: now + windowMs };
        data.set(key, entry);
      }
      entry.count += 1;
      return [entry.count, Math.max(0, entry.deadline - now)];
    },
    disconnect() {},
  };
}

describe("Redis rate limit store", () => {
  beforeEach(() => resetRateLimits());

  it("shares counters across store instances", async () => {
    const server = fakeRedis();
    const first = new RedisRateLimitStore("redis://test", server);
    const second = new RedisRateLimitStore("redis://test", server);
    const rule = { limit: 2, windowMs: 60_000 };

    expect((await first.hit("k", rule)).ok).toBe(true);
    expect((await second.hit("k", rule)).ok).toBe(true);
    const denied = await first.hit("k", rule);
    expect(denied.ok).toBe(false);
    expect(denied.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets the window after expiry", async () => {
    const server = fakeRedis();
    const store = new RedisRateLimitStore("redis://test", server);
    const rule = { limit: 1, windowMs: 100 };

    server.setNow(0);
    expect((await store.hit("k", rule)).ok).toBe(true);
    expect((await store.hit("k", rule)).ok).toBe(false);
    server.setNow(101);
    expect((await store.hit("k", rule)).ok).toBe(true);
  });

  it("routes rateLimitResponse through the active store", async () => {
    configureRateLimitStore(new RedisRateLimitStore("redis://test", fakeRedis()));
    expect(activeRateLimitStore().name).toBe("redis");
    const rule = { limit: 1, windowMs: 60_000 };
    const request = new Request("http://localhost/api/x");
    expect(await rateLimitResponse("route", request, rule)).toBeNull();
    const limited = await rateLimitResponse("route", request, rule);
    expect(limited?.status).toBe(429);
  });

  it("reports limit headers on success and on 429", async () => {
    configureRateLimitStore(new RedisRateLimitStore("redis://test", fakeRedis()));
    const rule = { limit: 2, windowMs: 60_000 };
    const request = new Request("http://localhost/api/x");

    const first = await enforceRateLimit("headers", request, rule);
    expect(first.response).toBeNull();
    expect(first.headers["X-RateLimit-Limit"]).toBe("2");
    expect(first.headers["X-RateLimit-Remaining"]).toBe("1");
    expect(Number(first.headers["X-RateLimit-Reset"])).toBeGreaterThan(0);

    await enforceRateLimit("headers", request, rule);
    const denied = await enforceRateLimit("headers", request, rule);
    expect(denied.response?.status).toBe(429);
    expect(denied.headers["X-RateLimit-Remaining"]).toBe("0");
    expect(denied.response?.headers.get("Retry-After")).toBeTruthy();
  });

  it("fails open when the store is down", async () => {    const broken = new RedisRateLimitStore("redis://test", {
      async eval() {
        throw new Error("connection refused");
      },
      disconnect() {},
    });
    configureRateLimitStore(broken);
    const request = new Request("http://localhost/api/x");
    expect(await rateLimitResponse("route", request, { limit: 1, windowMs: 60_000 })).toBeNull();
  });
});
