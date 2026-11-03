import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    event: { findMany: vi.fn(async () => []) },
    venue: { findMany: vi.fn(async () => []) },
    $transaction: vi.fn(async () => [
      [{ slug: "expo-one", updatedAt: new Date("2026-01-02T00:00:00Z") }],
      [{ slug: "hall-one", createdAt: new Date("2026-01-03T00:00:00Z") }],
    ]),
  },
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "id"] as const },
}));

import sitemap from "@/app/sitemap";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sitemap", () => {
  it("covers static routes, region editions, and slugs in every locale", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://xpo.events");
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    for (const locale of ["en", "id"]) {
      for (const path of ["", "/events", "/venues", "/calendar", "/privacy", "/terms"]) {
        expect(urls).toContain(`https://xpo.events/${locale}${path}`);
      }
      for (const code of ["id", "jp", "global"]) {
        expect(urls).toContain(`https://xpo.events/${locale}/region/${code}`);
      }
      expect(urls).toContain(`https://xpo.events/${locale}/events/expo-one`);
      expect(urls).toContain(`https://xpo.events/${locale}/venues/hall-one`);
    }

    // Private surfaces must never appear.
    expect(urls.some((url) => url.includes("/my-tickets"))).toBe(false);
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
  });
});
