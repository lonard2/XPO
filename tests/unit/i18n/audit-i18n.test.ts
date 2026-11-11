import { describe, it, expect } from "vitest";
import * as path from "path";
import {
  auditHardcodedUi,
  loadAllowlist,
  type I18nAllowlist,
} from "../../../scripts/lib/i18n-audit";

const FIXTURE = path.resolve(__dirname, "../../fixtures/i18n");
const EMPTY: I18nAllowlist = { exact: [], patterns: [], files: [] };

describe("hardcoded UI audit", () => {
  it("finds JSX text and copy-bearing attributes", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    const texts = result.hits.map((hit) => hit.text);

    expect(texts).toContain("Plain sentence here");
    expect(texts).toContain("Close dialog");
    expect(texts).toContain("Example site");
  });

  it("reports split JSX text as separate fragments", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    const texts = result.hits.map((hit) => hit.text);

    expect(texts).toContain("Split");
    expect(texts).toContain("across");
    expect(texts).toContain("nodes");
  });

  it("ignores className, href, and structural attributes", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });

    expect(result.hits.some((hit) => hit.text.includes("flex gap-2"))).toBe(false);
    expect(result.hits.some((hit) => hit.text.includes("https://"))).toBe(false);
    expect(result.hits.every((hit) => hit.attribute !== "className")).toBe(true);
    expect(result.hits.every((hit) => hit.attribute !== "href")).toBe(true);
  });

  it("suppresses only exact allowlist matches, never prefixes", () => {
    const exact = auditHardcodedUi({
      roots: [FIXTURE],
      allowlist: { exact: ["Plain sentence here"], patterns: [], files: [] },
      cwd: FIXTURE,
    });
    const prefix = auditHardcodedUi({
      roots: [FIXTURE],
      allowlist: { exact: ["Plain"], patterns: [], files: [] },
      cwd: FIXTURE,
    });

    expect(exact.hits.some((hit) => hit.text === "Plain sentence here")).toBe(false);
    expect(prefix.hits.some((hit) => hit.text === "Plain sentence here")).toBe(true);
  });

  it("reports the file and a one-based line number", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    const hit = result.hits.find((entry) => entry.text === "Plain sentence here");

    expect(hit?.file).toContain("sample.tsx");
    expect(hit?.line).toBe(5);
  });

  it("applies regex patterns to email addresses", () => {
    const result = auditHardcodedUi({
      roots: [FIXTURE],
      allowlist: { exact: [], patterns: ["^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"], files: [] },
      cwd: FIXTURE,
    });

    expect(result.hits.some((hit) => hit.text === "partner@fund.com")).toBe(false);
  });

  it("does not see strings held in variables", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    expect(result.hits.some((hit) => hit.text === "Hidden string")).toBe(false);
  });

  it("does not throw on JSX expressions", () => {
    expect(() =>
      auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE })
    ).not.toThrow();
  });

  it("loads the repository allowlist", () => {
    const allowlist = loadAllowlist();
    expect(allowlist.exact).toContain("B2B");
    expect(allowlist.patterns.some((pattern) => pattern.includes("https"))).toBe(true);
  });
});
