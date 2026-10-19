import { describe, it, expect } from "vitest";
import {
  archTitle,
  archTag,
  archDescription,
  clusterLabel,
  CLUSTER_LABEL_KEYS,
} from "@/lib/i18n/categories";

const tEn = (path: string) => {
  const dict: Record<string, string> = {
    "INDUSTRIAL_B2B.title": "Industrial & Manufacturing B2B",
    "INDUSTRIAL_B2B.tag": "Industrial & Manufacturing",
    "INDUSTRIAL_B2B.description": "Heavy machinery engineering.",
    clusterHeavy: "Heavy Industry",
  };
  return dict[path] ?? path;
};
(tEn as any).raw = (key: string) => {
  if (key === "RAW_ONLY") return { title: "Raw Title", tag: "Raw Tag", description: "Raw Desc" };
  return undefined;
};

describe("lib/i18n/categories", () => {
  it("prefers dictionary title, tag, and description", () => {
    expect(archTitle(tEn, "INDUSTRIAL_B2B", "Fallback")).toBe("Industrial & Manufacturing B2B");
    expect(archTag(tEn, "INDUSTRIAL_B2B", "Fallback")).toBe("Industrial & Manufacturing");
    expect(archDescription(tEn, "INDUSTRIAL_B2B", "Fallback")).toBe("Heavy machinery engineering.");
  });

  it("falls back to English originals when keys are missing", () => {
    const missing = (path: string) => path;
    expect(archTitle(missing, "NOPE", "Fallback Title")).toBe("Fallback Title");
    expect(archDescription(missing, "NOPE", "Fallback Desc")).toBe("Fallback Desc");
  });

  it("resolves raw message objects when direct lookup misses", () => {
    const directMiss = (path: string) => path;
    (directMiss as any).raw = (tEn as any).raw;
    expect(archTitle(directMiss, "RAW_ONLY", "Fallback")).toBe("Raw Title");
  });

  it("maps all six clusters plus ALL, unknown ids keep fallback", () => {
    expect(Object.keys(CLUSTER_LABEL_KEYS)).toHaveLength(7);
    expect(clusterLabel(tEn, "heavy_industry_infrastructure", "Heavy Industry")).toBe("Heavy Industry");
    expect(clusterLabel(tEn, "unknown_cluster", "Something")).toBe("Something");
  });
});
