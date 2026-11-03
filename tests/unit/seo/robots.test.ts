import { describe, it, expect, vi, afterEach } from "vitest";
import robots from "@/app/robots";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots.txt", () => {
  it("allows discovery pages and keeps transactional and portal routes out", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://xpo.events");
    const rules = robots();
    expect(rules.sitemap).toBe("https://xpo.events/sitemap.xml");
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : (rules.rules as any);
    const disallow = (rule.disallow || []) as string[];
    for (const blocked of ["/api/", "/*/dashboard", "/*/admin", "/*/my-tickets", "/*/events/new", "/*/scanner"]) {
      expect(disallow.some((entry) => entry.startsWith(blocked))).toBe(true);
    }
  });
});
