import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utility: cn (classnames merger)", () => {
  it("merges class names correctly", () => {
    const result = cn("p-4", "text-center", "bg-white");
    expect(result).toBe("p-4 text-center bg-white");
  });

  it("handles conditional classes", () => {
    const isPrimary = true;
    const isSmall = false;
    const result = cn("base-class", isPrimary && "text-blue-500", isSmall && "text-sm");
    expect(result).toBe("base-class text-blue-500");
  });

  it("resolves Tailwind conflicts in favor of the latest class", () => {
    const result = cn("p-4 text-red-500", "p-8 text-blue-500");
    expect(result).toBe("p-8 text-blue-500");
  });
});
