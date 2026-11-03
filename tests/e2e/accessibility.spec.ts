import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility gate at impact critical only. Serious-level findings exist
 * (the deferred 11px category-kicker contrast debt) and are tracked, not
 * silently waived per run: anything critical still fails the build.
 */
test.describe("accessibility", () => {
  for (const path of ["/en", "/en/events", "/en/venues/jiexpo-kemayoran"]) {
    test(`no critical violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .include("main")
        .analyze();
      const critical = results.violations.filter((violation) =>
        violation.nodes.some((node) => node.impact === "critical")
      );
      expect(
        critical.map((violation) => `${violation.id}: ${violation.help}`),
        `critical a11y violations on ${path}`
      ).toEqual([]);
    });
  }
});
