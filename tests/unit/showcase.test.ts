import { describe, it, expect } from "vitest";
import {
  parseShowcase,
  validateShowcase,
  isEmptyShowcase,
  showcaseAgeDays,
  showcaseDateLabel,
  SHOWCASE_LIMITS,
  SHOWCASE_STALE_DAYS,
} from "@/lib/showcase";

describe("showcase content model", () => {
  it("parses empty and garbage input to an empty showcase", () => {
    expect(isEmptyShowcase(parseShowcase(null))).toBe(true);
    expect(isEmptyShowcase(parseShowcase("not-json"))).toBe(true);
    expect(isEmptyShowcase(parseShowcase({ programs: [{ kind: "nope" }] }))).toBe(true);
  });

  it("accepts a valid showcase with rows", () => {
    const { ok, data } = validateShowcase({
      livestreamUrl: "https://stream.example.com/live",
      livestreamLive: true,
      programs: [{ kind: "bounty", title: "Best Demo", detail: "$5k", sponsor: "Acme" }],
      alerts: ["Doors open at 08:00"],
      channels: [{ code: "CH 1", lang: "English" }],
    });
    expect(ok).toBe(true);
    expect(data!.programs.length).toBe(1);
    expect(isEmptyShowcase(data!)).toBe(false);
  });

  it("rejects bad URLs, bad kinds, and over-limit rows", () => {
    const badUrl = validateShowcase({ livestreamUrl: "not a url" });
    expect(badUrl.ok).toBe(false);
    expect(badUrl.issues?.["livestreamUrl"]).toBeDefined();

    const tooMany = validateShowcase({
      programs: Array.from({ length: SHOWCASE_LIMITS.programs + 1 }, (_, i) => ({
        kind: "generic",
        title: `P${i}`,
      })),
    });
    expect(tooMany.ok).toBe(false);
  });

  it("defaults attestation off and measures content age", () => {
    const parsed = parseShowcase({});
    expect(parsed.attested).toBe(false);
    expect(showcaseAgeDays(parsed)).toBeNull();
    expect(showcaseDateLabel(parsed)).toBeNull();

    const old = { attestedAt: new Date(Date.now() - 200 * 86400000).toISOString() };
    expect((showcaseAgeDays(old) || 0) > SHOWCASE_STALE_DAYS).toBe(true);
    expect(showcaseDateLabel(old, "en")).toMatch(/\d{4}/);
  });
});
