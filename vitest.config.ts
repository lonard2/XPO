import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    // Playwright specs run under `npm run test:e2e`, never vitest.
    exclude: ["node_modules/", "tests/e2e/**"],
    // Integration files share one Postgres database. Running files in
    // parallel lets one file's temporary venue or event leak into another
    // file's exact-count or delete assertion. Serial files trade a little
    // wall time for deterministic results.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}"],
      // Floor sits just under measured actuals (lines ~64.6, functions ~57.6).
      // Ratchet upward as coverage backfills; never lower to make red green.
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 50,
        statements: 60,
      },
    },
  },
});
