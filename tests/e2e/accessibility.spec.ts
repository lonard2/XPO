import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility gate at serious impact and above. The former kicker
 * contrast debt is fixed (derived archetype label tones, full-strength
 * footnote ink), so anything serious or critical fails the build.
 */
test.describe("accessibility", () => {
  for (const path of ["/en", "/en/events", "/en/venues/jiexpo-kemayoran"]) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .include("main")
        .analyze();
      const blocking = results.violations.filter((violation) =>
        violation.nodes.some((node) => node.impact === "serious" || node.impact === "critical")
      );
      expect(
        blocking.map((violation) => `${violation.id}: ${violation.help}`),
        `serious a11y violations on ${path}`
      ).toEqual([]);
    });
  }
});
