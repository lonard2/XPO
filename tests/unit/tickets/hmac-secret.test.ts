import { describe, it, expect, afterEach, vi } from "vitest";

const REAL_ENV = process.env.QR_HMAC_SECRET;

afterEach(() => {
  if (REAL_ENV === undefined) delete process.env.QR_HMAC_SECRET;
  else process.env.QR_HMAC_SECRET = REAL_ENV;
  vi.unstubAllEnvs();
});

describe("HMAC secret resolution", () => {
  it("fails closed in production without a configured secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.QR_HMAC_SECRET;
    const { hmacSecret } = await import("@/lib/tickets/qrPass");
    expect(() => hmacSecret()).toThrow(/QR_HMAC_SECRET/);
  });

  it("uses the configured secret when present", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.QR_HMAC_SECRET = "unit-test-secret";
    const { hmacSecret } = await import("@/lib/tickets/qrPass");
    expect(hmacSecret()).toBe("unit-test-secret");
  });

  it("allows the dev fallback outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.QR_HMAC_SECRET;
    const { hmacSecret } = await import("@/lib/tickets/qrPass");
    expect(typeof hmacSecret()).toBe("string");
  });
});
