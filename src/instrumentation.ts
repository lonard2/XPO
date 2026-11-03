import { validateEnv } from "@/lib/config/env";
import { configureRateLimitStore, RedisRateLimitStore } from "@/lib/api/rateLimit";

/**
 * Runs once when the server boots (never during `next build`). A bad
 * environment stops the container here with a named complaint instead of
 * serving traffic that cannot sign users in or verify passes.
 */
export async function register() {
  const report = validateEnv();
  for (const warning of report.warnings) {
    console.warn(`[boot] ${warning}`);
  }
  if (!report.ok) {
    throw new Error(`[boot] invalid environment: ${report.errors.join(" ")}`);
  }

  if (process.env.REDIS_URL) {
    configureRateLimitStore(new RedisRateLimitStore(process.env.REDIS_URL));
    console.info("[boot] rate limits share Redis");
  }
}
