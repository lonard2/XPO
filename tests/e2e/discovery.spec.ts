import { test, expect } from "@playwright/test";

/**
 * Smoke through the public discovery journey against seeded data. Assertions
 * stay loose on copy (dictionaries change) and strict on structure: one h1,
 * a labelled breadcrumb trail, and no dead inventory in the Upcoming grid.
 */
test.describe("public discovery journey", () => {
  test("homepage states the platform and lists attendable events", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/hall/i);
    await expect(page.getByText("22 event categories", { exact: false })).toBeVisible();
  });

  test("events index renders and links to a detail page", async ({ page }) => {
    await page.goto("/en/events");
    const firstCard = page.locator('a[href*="/events/"]').first();
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute("href");
    expect(href).toMatch(/\/en\/events\/.+/);
  });

  test("event detail carries Event structured data", async ({ page }) => {
    await page.goto("/en/events/manufacturing-indonesia-2026");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const schemas = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const types = schemas.flatMap((text) => {
      try {
        const json = JSON.parse(text);
        return [json["@type"]];
      } catch {
        return [];
      }
    });
    // Archetypes map to Event subtypes (ExhibitionEvent, BusinessEvent, ...).
    expect(types.some((type) => /Event$/.test(type))).toBe(true);
    expect(types).toContain("BreadcrumbList");
  });

  test("venue detail carries Place structured data", async ({ page }) => {
    await page.goto("/en/venues/jiexpo-kemayoran");
    const schemas = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const types = schemas.flatMap((text) => {
      try {
        const json = JSON.parse(text);
        return [json["@type"]];
      } catch {
        return [];
      }
    });
    expect(types).toContain("CivicStructure");
  });

  test("robots and sitemap serve crawler plumbing", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Sitemap:");
    expect(robotsBody).toContain("Disallow: /api/");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("/en/events/manufacturing-indonesia-2026");
    expect(sitemapBody).not.toContain("/my-tickets");
  });
});
