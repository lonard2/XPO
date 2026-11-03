import { defineConfig, devices } from "@playwright/test";

/**
 * Browser E2E against a seeded database. The webServer boots `next dev`
 * against DATABASE_URL, so CI must seed Postgres first (it already does).
 * Chromium only: the matrix buys little here and costs minutes per run.
 *
 * Axe runs at impact critical only. Serious-level color-contrast debt on the
 * 11px category kickers is a known, deferred visual decision, not something
 * a gate should either bless or silently waive per run.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3111",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next dev -p 3111",
    url: "http://localhost:3111/en",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      QR_HMAC_SECRET: process.env.QR_HMAC_SECRET ?? "e2e-secret-not-for-production",
      ALLOW_DEMO_AUTH: process.env.ALLOW_DEMO_AUTH ?? "true",
    },
  },
});
