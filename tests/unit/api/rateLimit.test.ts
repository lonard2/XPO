import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits, clientIp } from "@/lib/api/rateLimit";

describe("rate limiter", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit then denies with retry-after", () => {
    const rule = { limit: 3, windowMs: 60_000 };
    expect(checkRateLimit("k", rule, 1000).ok).toBe(true);
    expect(checkRateLimit("k", rule, 1001).ok).toBe(true);
    expect(checkRateLimit("k", rule, 1002).ok).toBe(true);
    const denied = checkRateLimit("k", rule, 1003);
    expect(denied.ok).toBe(false);
    expect(denied.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets when the window passes and isolates keys", () => {
    const rule = { limit: 1, windowMs: 100 };
    expect(checkRateLimit("a", rule, 0).ok).toBe(true);
    expect(checkRateLimit("a", rule, 50).ok).toBe(false);
    expect(checkRateLimit("a", rule, 101).ok).toBe(true);
    expect(checkRateLimit("b", rule, 101).ok).toBe(true);
  });

  it("keys clients by forwarded address", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "9.9.9.9, 1.1.1.1" },
    });
    expect(clientIp(req)).toBe("9.9.9.9");
    expect(clientIp(new Request("http://localhost/"))).toBe("unknown");
  });
});
