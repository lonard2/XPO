import { describe, it, expect } from "vitest";
import { featuredGridClass, venueGridClass } from "@/lib/discovery/grids";

describe("grid classes follow inventory", () => {
  it("never leaves empty columns for one or two featured events", () => {
    expect(featuredGridClass(1)).toContain("max-w-3xl");
    expect(featuredGridClass(1)).not.toContain("lg:grid-cols-3");
    expect(featuredGridClass(2)).toContain("md:grid-cols-2");
    expect(featuredGridClass(2)).not.toContain("lg:grid-cols-3");
  });

  it("scales to three and beyond", () => {
    expect(featuredGridClass(3)).toContain("lg:grid-cols-3");
    expect(featuredGridClass(3)).not.toContain("2xl:grid-cols-4");
    expect(featuredGridClass(9)).toContain("2xl:grid-cols-4");
  });

  it("centres a lone venue card", () => {
    expect(venueGridClass(1)).toContain("mx-auto");
    expect(venueGridClass(1)).not.toContain("md:grid-cols-2");
    expect(venueGridClass(2)).toContain("md:grid-cols-2");
    expect(venueGridClass(3)).toContain("xl:grid-cols-3");
  });
});
