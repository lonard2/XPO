import { describe, it, expect, vi, afterEach } from "vitest";
import { validateEnv } from "@/lib/config/env";

const base = {
  DATABASE_URL: "postgresql://xpo:pw@db:5432/xpo",
  QR_HMAC_SECRET: "a".repeat(64),
};

describe("startup environment validation", () => {
  it("passes a complete production environment", () => {
    const report = validateEnv(
      {
        ...base,
        NODE_ENV: "production",
        ALLOW_DEMO_AUTH: "false",
        RESEND_API_KEY: "re_test",
        ALERT_WEBHOOK_URL: "https://hooks.example.com/x",
        NEXT_PUBLIC_APP_URL: "https://staging.example.com",
        CRON_SECRET: "cron_test_secret",
      },
      "production"
    );
    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it("warns when the reminder secret is missing in production", () => {
    const report = validateEnv(
      {
        ...base,
        NODE_ENV: "production",
        ALLOW_DEMO_AUTH: "false",
        RESEND_API_KEY: "re_test",
        ALERT_WEBHOOK_URL: "https://hooks.example.com/x",
        NEXT_PUBLIC_APP_URL: "https://staging.example.com",
      },
      "production"
    );
    expect(report.ok).toBe(true);
    expect(report.warnings.join(" ")).toMatch(/CRON_SECRET/);
  });

  it("fails fast on a missing database and secret", () => {
    const report = validateEnv({}, "production");
    expect(report.ok).toBe(false);
    expect(report.errors.join(" ")).toMatch(/DATABASE_URL/);
    expect(report.errors.join(" ")).toMatch(/QR_HMAC_SECRET/);
  });

  it("rejects the compose dev placeholder and demo auth in production", () => {
    const report = validateEnv(
      {
        ...base,
        QR_HMAC_SECRET: "dev-only-secret-not-for-production",
        ALLOW_DEMO_AUTH: "true",
      },
      "production"
    );
    expect(report.ok).toBe(false);
    expect(report.errors.join(" ")).toMatch(/placeholder/);
    expect(report.errors.join(" ")).toMatch(/ALLOW_DEMO_AUTH/);
  });

  it("warns instead of failing on unconfigured email and alerts", () => {
    const report = validateEnv({ ...base, ALLOW_DEMO_AUTH: "false" }, "production");
    expect(report.ok).toBe(true);
    expect(report.warnings.join(" ")).toMatch(/email provider/);
    expect(report.warnings.join(" ")).toMatch(/ALERT_WEBHOOK_URL/);
  });

  it("stays quiet in development without providers", () => {
    const report = validateEnv({ ...base }, "development");
    expect(report.ok).toBe(true);
    expect(report.warnings).toEqual([]);
  });

  it("allows development to boot without a signing secret, with a warning", () => {
    const report = validateEnv({ DATABASE_URL: "postgresql://x" }, "development");
    expect(report.ok).toBe(true);
    expect(report.warnings.join(" ")).toMatch(/QR_HMAC_SECRET/);
  });
});

describe("server boot hook", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to boot production with an invalid environment", async () => {
    const { register } = await import("@/instrumentation");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("QR_HMAC_SECRET", "short");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("REDIS_URL", "");
    await expect(register()).rejects.toThrow(/DATABASE_URL/);
  });
});
