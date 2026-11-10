import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const NAVBAR = path.resolve(
  __dirname,
  "../../../../src/components/layout/Navbar.tsx"
);

describe("Quality Gate: phone top bar", () => {
  const navbar = fs.readFileSync(NAVBAR, "utf8");

  it("keeps language and auth out of the phone cluster", () => {
    // Brand + edition + theme + menu must fit 390. Language and auth move
    // into the menu below sm, where the persona banner already opens auth.
    expect(navbar).toContain("hidden sm:block");
    expect(navbar).toContain("hidden sm:flex");
  });

  it("offers a clear sign-in action inside the mobile drawer", () => {
    expect(navbar).toContain("data-mobile-signin");
  });

  it("keeps the edition switcher visible at every width", () => {
    expect(navbar).toContain('<div className="lg:hidden">');
    expect(navbar).toContain("compact");
  });
});
