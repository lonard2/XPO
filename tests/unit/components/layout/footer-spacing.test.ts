import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const FOOTER = path.resolve(
  __dirname,
  "../../../../src/components/layout/Footer.tsx"
);

describe("Quality Gate: footer clearance", () => {
  it("reserves enough bottom space for the concierge FAB", () => {
    const footer = fs.readFileSync(FOOTER, "utf8");
    expect(footer).toContain("pb-36");
    expect(footer).not.toContain("pb-28");
  });
});
