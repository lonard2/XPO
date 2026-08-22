import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { GET as getEventsRoute, POST as createEventRoute } from "@/app/api/organizer/events/route";
import { PUT as updateBrandingRoute } from "@/app/api/organizer/events/[id]/branding/route";
import { GET as getBoothsRoute, POST as createBoothRoute } from "@/app/api/organizer/booths/route";

describe("Phase 9 Integration: Organizer Portal & Management API Routes", () => {
  let sampleVenue: any;
  let createdEventId: string;

  beforeAll(async () => {
    await db.$connect();
    sampleVenue = await db.venue.findFirst({
      include: { halls: true },
    });
  });

  afterAll(async () => {
    if (createdEventId) {
      await db.event.delete({
        where: { id: createdEventId },
      }).catch(() => {});
    }
    await db.$disconnect();
  });

  it("Organizer Events: GET retrieves list of registered exhibitions", async () => {
    const res = await getEventsRoute();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.events)).toBe(true);
    expect(json.events.length).toBeGreaterThan(0);
  });

  it("Organizer Events: POST rejects requests with missing mandatory fields (400)", async () => {
    const req = new Request("http://localhost:3000/api/organizer/events", {
      method: "POST",
      body: JSON.stringify({
        title: "Incomplete Event",
        // missing description, venueId, dates
      }),
    });

    const res = await createEventRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("Organizer Events: POST creates new event with ticket tiers and branding (201)", async () => {
    const req = new Request("http://localhost:3000/api/organizer/events", {
      method: "POST",
      body: JSON.stringify({
        title: "Test AI & Robotics Trade Fair 2027",
        slug: "test-ai-robotics-fair-2027",
        description: "Comprehensive robotics trade fair and supply chain expo.",
        archetype: "TECH_DEV_SUMMIT",
        format: "HYBRID",
        scale: "LARGE",
        regionId: "id",
        venueId: sampleVenue.id,
        venueHallId: sampleVenue.halls?.[0]?.id,
        startDate: "2027-08-10T09:00:00.000Z",
        endDate: "2027-08-14T18:00:00.000Z",
        primaryColor: "#6366f1",
        accentColor: "#06b6d4",
        ticketTiers: [
          {
            name: "Standard Technical Delegate",
            price: 250000,
            currency: "IDR",
            capacity: 2000,
            benefits: ["Floor Access", "Tech Keynotes"],
          },
        ],
      }),
    });

    const res = await createEventRoute(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.event).toBeDefined();
    expect(json.event.title).toBe("Test AI & Robotics Trade Fair 2027");
    expect(json.event.ticketTiers.length).toBe(1);

    createdEventId = json.event.id;
  });

  it("Organizer Branding: PUT updates event theme tokens and hero media", async () => {
    expect(createdEventId).toBeDefined();

    const brandingConfig = {
      primaryColor: "#9333ea",
      accentColor: "#ec4899",
      heroBadge: "Flagship 2027 Edition",
      bannerOverlayOpacity: 0.8,
    };

    const req = new Request(`http://localhost:3000/api/organizer/events/${createdEventId}/branding`, {
      method: "PUT",
      body: JSON.stringify({
        brandingConfig,
        heroImageUrl: "https://images.unsplash.com/photo-custom.jpg",
      }),
    });

    const res = await updateBrandingRoute(req, {
      params: Promise.resolve({ id: createdEventId }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.event.heroImageUrl).toBe("https://images.unsplash.com/photo-custom.jpg");
    expect(json.event.brandingConfigJson).toContain("#9333ea");
  });

  it("Organizer Booths: POST creates a new booth and GET filters by hall", async () => {
    expect(createdEventId).toBeDefined();

    // Create booth
    const createReq = new Request("http://localhost:3000/api/organizer/booths", {
      method: "POST",
      body: JSON.stringify({
        eventId: createdEventId,
        companyName: "PT Global Tech Automation",
        boothNumber: "Hall A1 - B10",
        hallName: "Hall A1",
        industry: "Robotics",
        websiteUrl: "https://globaltech.co.id",
        description: "Smart automation solutions",
      }),
    });

    const createRes = await createBoothRoute(createReq);
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.success).toBe(true);
    expect(createJson.booth.companyName).toBe("PT Global Tech Automation");

    // Fetch booths filtered by eventId
    const getReq = new Request(`http://localhost:3000/api/organizer/booths?eventId=${createdEventId}`);
    const getRes = await getBoothsRoute(getReq);
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.success).toBe(true);
    expect(getJson.booths.length).toBeGreaterThanOrEqual(1);
    expect(getJson.booths[0].boothNumber).toBe("Hall A1 - B10");
  });
});
