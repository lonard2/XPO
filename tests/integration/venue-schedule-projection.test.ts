import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { loadVenueSchedule } from "@/lib/discovery/schedule";

describe("Venue schedule discreet projection", () => {
  const stamp = Date.now();
  let venueId: string;
  let discreetId: string;
  let publicId: string;
  const secretTitle = `Projection Secret ${stamp}`;

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst({ select: { id: true } });
    if (!venue) throw new Error("seeded venue required");
    venueId = venue.id;
    const start = new Date(Date.now() + 86400000 * 20);
    const end = new Date(Date.now() + 86400000 * 21);
    const discreet = await db.event.create({
      data: {
        title: secretTitle,
        slug: `projection-secret-${stamp}`,
        description: "Unannounced corporate booking.",
        venueId,
        regionId: "id",
        startDate: start,
        endDate: end,
        archetype: "AUTOMOTIVE_MOBILITY",
        visibility: "DISCREET",
      },
    });
    const open = await db.event.create({
      data: {
        title: `Projection Public ${stamp}`,
        slug: `projection-public-${stamp}`,
        description: "Public expo.",
        venueId,
        regionId: "id",
        startDate: start,
        endDate: end,
        archetype: "INDUSTRIAL_B2B",
        visibility: "PUBLIC",
      },
    });
    discreetId = discreet.id;
    publicId = open.id;
  });

  afterAll(async () => {
    await db.event.deleteMany({
      where: { id: { in: [discreetId, publicId] } },
    });
    await db.$disconnect();
  });

  it("returns discreet rows without identity fields and keeps public rows whole", async () => {
    const rows = await loadVenueSchedule(venueId);

    const discreet = rows.find((row) => row.id === discreetId);
    expect(discreet).toBeDefined();
    expect(discreet).toMatchObject({ discreet: true });
    // The projection never selected these keys, so they cannot leak.
    expect(Object.keys(discreet as object)).not.toContain("title");
    expect(Object.keys(discreet as object)).not.toContain("organizer");
    expect(Object.keys(discreet as object)).not.toContain("description");
    expect(JSON.stringify(discreet)).not.toContain(secretTitle);

    const open = rows.find((row) => row.id === publicId);
    expect(open).toBeDefined();
    expect((open as { title: string }).title).toBe(`Projection Public ${stamp}`);
  });
});
