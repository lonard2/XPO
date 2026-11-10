import { describe, it, expect } from "vitest";
import { rowGridClass } from "@/lib/discovery/grids";

describe("grid classes follow inventory", () => {
  it("never leaves empty columns for one or two items", () => {
    expect(rowGridClass(1)).toContain("max-w-none");
    expect(rowGridClass(1)).not.toContain("mx-auto");
    expect(rowGridClass(1)).not.toContain("lg:grid-cols-3");
    expect(rowGridClass(2)).toContain("md:grid-cols-2");
    expect(rowGridClass(2)).not.toContain("lg:grid-cols-3");
  });

  it("scales to three and four", () => {
    expect(rowGridClass(3)).toContain("lg:grid-cols-3");
    expect(rowGridClass(4)).toContain("xl:grid-cols-4");
    expect(rowGridClass(4)).not.toContain("1800px");
  });

  it("uses five columns only where the container fits them", () => {
    expect(rowGridClass(5)).toContain("min-[1800px]:grid-cols-5");
    expect(rowGridClass(9)).toContain("min-[1800px]:grid-cols-5");
  });

  it("honours a per-row column cap for dense cards", () => {
    expect(rowGridClass(4, 3)).toContain("lg:grid-cols-3");
    expect(rowGridClass(4, 3)).not.toContain("xl:grid-cols-4");
    expect(rowGridClass(9, 3)).not.toContain("1800px");
  });
});
