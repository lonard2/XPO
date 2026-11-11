import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGE = path.resolve(
  __dirname,
  "../../../src/app/[locale]/(organizer)/events/[slug]/customizer/page.tsx"
);
const CARD = path.resolve(
  __dirname,
  "../../../src/components/organizer/VenueReassignmentCard.tsx"
);

describe("Quality Gate: customizer venue reassignment", () => {
  it("mounts the card only for an event with a real venue", () => {
    const page = fs.readFileSync(PAGE, "utf8");
    expect(page).toContain("VenueReassignmentCard");
    expect(page).toContain("eventData?.venue?.id &&");
  });

  it("keeps the card free of emojis and em dashes", () => {
    const card = fs.readFileSync(CARD, "utf8");
    expect(card).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(card).not.toContain("\u2014");
  });

  it("keeps the merged venue region in sync after saving", () => {
    const page = fs.readFileSync(PAGE, "utf8");
    expect(page).toContain("regionId: saved.regionId");
  });
});
