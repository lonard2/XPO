/**
 * Startup environment validation. Reads config in one place so a missing or
 * dangerous value fails fast at boot with a named complaint, instead of
 * surfacing hours later as a locked-out user or an open demo portal.
 */

export interface EnvReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const DEV_PLACEHOLDER_SECRET = "dev-only-secret-not-for-production";

export function validateEnv(
  env: Record<string, string | undefined> = process.env,
  nodeEnv: string | undefined = process.env.NODE_ENV
): EnvReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const isProd = nodeEnv === "production";
  const secret = env.QR_HMAC_SECRET || "";

  if (!env.DATABASE_URL) {
    errors.push("DATABASE_URL is not set.");
  }
  if (!secret) {
    errors.push("QR_HMAC_SECRET is not set.");
  } else if (secret.length < 32) {
    errors.push("QR_HMAC_SECRET is shorter than 32 characters.");
  }

  if (isProd) {
    if (secret === DEV_PLACEHOLDER_SECRET) {
      errors.push("QR_HMAC_SECRET is still the compose dev placeholder.");
    }
    if ((env.ALLOW_DEMO_AUTH || "").toLowerCase() === "true") {
      errors.push("ALLOW_DEMO_AUTH is true in production: anyone could claim a demo persona.");
    }
    if (!env.RESEND_API_KEY && !env.SMTP_URL) {
      warnings.push(
        "No email provider is configured (RESEND_API_KEY or SMTP_URL): OTP delivery will throw."
      );
    }
    if (!env.ALERT_WEBHOOK_URL) {
      warnings.push("ALERT_WEBHOOK_URL is not set: errors will log but never alert.");
    }
    if (!env.NEXT_PUBLIC_APP_URL) {
      warnings.push("NEXT_PUBLIC_APP_URL is not set: canonicals fall back to https://xpo.events.");
    }
    if (!env.CRON_SECRET) {
      warnings.push(
        "CRON_SECRET is not set: the reminder endpoint will reject every scheduler call."
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
