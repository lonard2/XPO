import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const BANNER = path.resolve(
  __dirname,
  "../../../src/components/discovery/BannerCarousel.tsx"
);
const IDENTITY = path.resolve(
  __dirname,
  "../../../src/components/discovery/IdentityStrip.tsx"
);
const EVENT_CARD = path.resolve(
  __dirname,
  "../../../src/components/discovery/EventCard.tsx"
);

describe("Quality Gate: homepage hero hierarchy", () => {
  const banner = fs.readFileSync(BANNER, "utf8");
  const identity = fs.readFileSync(IDENTITY, "utf8");
  const card = fs.readFileSync(EVENT_CARD, "utf8");

  it("gives the story column at least half of the hero", () => {
    expect(banner).toContain("lg:grid-cols-[1fr_1.4fr]");
  });

  it("moves the carousel controls away from the badge row and the strip", () => {
    expect(banner).toContain("lg:top-4");
    expect(banner).toContain("lg:left-4");
    expect(banner).toContain("lg:bottom-auto");
    expect(banner).not.toContain("lg:bottom-4");
  });

  it("keeps the platform H1 larger than the event title", () => {
    expect(identity).toContain("sm:text-5xl");
    expect(banner).toContain("lg:text-4xl");
  });

  it("pauses autoplay when reduced motion is requested", () => {
    expect(banner).toContain("prefers-reduced-motion");
  });

  it("reserves a mobile safe zone under the hero CTA", () => {
    expect(banner).toContain("pb-28");
    expect(banner).toContain("pt-12");
  });

  it("gives every focusable element a visible 2px outline", () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, "../../../src/app/globals.css"),
      "utf8"
    );
    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline: 2px");
  });

  it("gives the primary card link a visible focus ring", () => {
    expect(card).toContain("focus-visible:ring-2");
    expect(card).toContain("data-variant={variant}");
  });
});
