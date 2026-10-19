import { describe, it, expect } from "vitest";
import {
  regionName,
  regionDescription,
  regionKeyVenues,
  languageLabel,
  languageHint,
} from "@/lib/i18n/registry";

const dict: Record<string, string> = {
  "jp.name": "Jepang",
  "jp.description": "Pusat robotika.",
  "jp.keyVenues": "Tokyo Big Sight",
  language_ja: "Jepang",
  languageHint_ja: "Jepang (JST)",
};
const t = (path: string) => dict[path] ?? path;
const missing = (path: string) => path;

describe("lib/i18n/registry", () => {
  it("resolves region display strings from dictionaries", () => {
    expect(regionName(t, "jp", "Japan")).toBe("Jepang");
    expect(regionDescription(t, "jp", "English desc")).toBe("Pusat robotika.");
    expect(regionKeyVenues(t, "jp", "Tokyo Big Sight")).toBe("Tokyo Big Sight");
  });

  it("falls back to registry values when keys are absent", () => {
    expect(regionName(missing, "jp", "Japan")).toBe("Japan");
    expect(languageLabel(missing, "ja", "Japanese")).toBe("Japanese");
    expect(languageHint(missing, "ja", "Japan (JST)")).toBe("Japan (JST)");
  });

  it("resolves language labels and hints from dictionaries", () => {
    expect(languageLabel(t, "ja", "Japanese")).toBe("Jepang");
    expect(languageHint(t, "ja", "Japan (JST)")).toBe("Jepang (JST)");
  });
});
