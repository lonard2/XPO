import { describe, it, expect, afterEach, vi } from "vitest";
import { siteBaseUrl } from "@/lib/seo/site";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteBaseUrl", () => {
  it("prefers the app URL and strips trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.example.com/");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://other.example.com");
    expect(siteBaseUrl()).toBe("https://staging.example.com");
  });

  it("falls back to the site URL, then the production domain", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://xpo-staging.example.com///");
    expect(siteBaseUrl()).toBe("https://xpo-staging.example.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteBaseUrl()).toBe("https://xpo.events");
  });
});
