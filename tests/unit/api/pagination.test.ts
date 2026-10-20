import { describe, it, expect } from "vitest";
import { parsePagination, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/api/pagination";

describe("parsePagination", () => {
  it("defaults to the standard window", () => {
    expect(parsePagination(new URLSearchParams())).toEqual({ take: DEFAULT_PAGE_SIZE, skip: 0 });
  });

  it("honors valid take and skip", () => {
    expect(parsePagination(new URLSearchParams("take=25&skip=50"))).toEqual({ take: 25, skip: 50 });
  });

  it("clamps oversized takes and rejects garbage", () => {
    expect(parsePagination(new URLSearchParams("take=9999"))).toEqual({ take: MAX_PAGE_SIZE, skip: 0 });
    expect(parsePagination(new URLSearchParams("take=-5&skip=-1"))).toEqual({ take: DEFAULT_PAGE_SIZE, skip: 0 });
    expect(parsePagination(new URLSearchParams("take=abc"))).toEqual({ take: DEFAULT_PAGE_SIZE, skip: 0 });
  });
});
