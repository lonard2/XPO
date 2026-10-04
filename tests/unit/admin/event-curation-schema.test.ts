import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("Event Model Curation Attributes", () => {
  it("allows event creation with null organizerId, custom organizerName, and isPlatformCurated flag", async () => {
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    const testSlug = `curated-test-${Date.now()}`;
    const event = await db.event.create({
      data: {
        title: "Test Municipal Expo 2026",
        slug: testSlug,
        description: "Official platform curated convention listing.",
        organizerId: null,
        organizerName: "Jakarta Trade & Convention Bureau",
        isPlatformCurated: true,
        regionId: venue!.regionId,
        venueId: venue!.id,
        startDate: new Date("2026-11-01T09:00:00Z"),
        endDate: new Date("2026-11-03T18:00:00Z"),
      },
    });

    expect(event.id).toBeDefined();
    expect(event.organizerId).toBeNull();
    expect(event.organizerName).toBe("Jakarta Trade & Convention Bureau");
    expect(event.isPlatformCurated).toBe(true);

    // Clean up
    await db.event.delete({ where: { id: event.id } });
  });
});
