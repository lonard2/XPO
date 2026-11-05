import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";
import { POST as createEvent } from "@/app/api/organizer/events/route";
import { PUT as updateBranding } from "@/app/api/organizer/events/[id]/branding/route";
import { PATCH as updatePresentation } from "@/app/api/admin/events/[id]/presentation/route";
import { PUT as updateVenue } from "@/app/api/admin/venues/[id]/route";

describe("Tiers: role-split tier and visibility editing", () => {
  const adminHeaders = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ADMIN",
  };

  let venueId: string;
  let ownedEventId: string;
  let ownedOrganizerId: string;
  let createdEventId: string | null = null;

  const ownerHeaders = () => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
    "x-xpo-user-id": ownedOrganizerId,
  });

  const validBody = () => ({
    title: `Tier Probe Expo ${Date.now()}`,
    description: "Tier probe.",
    archetype: "INDUSTRIAL_B2B",
    regionId: "id",
    venueId,
    startDate: "2027-09-10T09:00:00.000Z",
    endDate: "2027-09-12T18:00:00.000Z",
    ticketTiers: [],
  });

  const post = (body: unknown, headers: Record<string, string>) =>
    createEvent(
      new Request("http://localhost:3000/api/organizer/events", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })
    );

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst({ select: { id: true } });
    if (!venue) throw new Error("seeded venue required");
    venueId = venue.id;
    const owned = await db.event.findFirst({
      where: { organizerId: { not: null } },
      select: { id: true, organizerId: true },
    });
    if (!owned?.organizerId) throw new Error("owned seeded event required");
    ownedEventId = owned.id;
    ownedOrganizerId = owned.organizerId;
  });

  afterAll(async () => {
    if (createdEventId) {
      await db.event.delete({ where: { id: createdEventId } }).catch(() => {});
    }
    await db.$disconnect();
  });

  it("rejects creation without an explicit tier", async () => {
    const res = await post(validBody(), adminHeaders);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("stores the chosen tier on creation", async () => {
    const res = await post({ ...validBody(), pageSize: "SMALL" }, adminHeaders);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.event.pageSize).toBe("SMALL");
    createdEventId = json.event.id;
  });

  it("rejects organizer visibility writes but applies tier writes", async () => {
    const bad = await updateBranding(
      new Request(`http://localhost:3000/api/organizer/events/${ownedEventId}/branding`, {
        method: "PUT",
        headers: ownerHeaders(),
        body: JSON.stringify({ visibility: "HIDDEN" }),
      }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(bad.status).toBe(400);

    const row = await db.event.findUnique({
      where: { id: ownedEventId },
      select: { visibility: true },
    });
    expect(row?.visibility).toBe("PUBLIC");

    const good = await updateBranding(
      new Request(`http://localhost:3000/api/organizer/events/${ownedEventId}/branding`, {
        method: "PUT",
        headers: ownerHeaders(),
        body: JSON.stringify({ pageSize: "SMALL" }),
      }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(good.status).toBe(200);
    const goodJson = await good.json();
    expect(goodJson.event.pageSize).toBe("SMALL");

    await db.event.update({
      where: { id: ownedEventId },
      data: { pageSize: null },
    });
  });

  it("lets admins set size and visibility together", async () => {
    const res = await updatePresentation(
      new Request(`http://localhost:3000/api/admin/events/${ownedEventId}/presentation`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ pageSize: "MEDIUM", visibility: "PUBLIC" }),
      }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.event.pageSize).toBe("MEDIUM");

    const org = await updatePresentation(
      new Request(`http://localhost:3000/api/admin/events/${ownedEventId}/presentation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "xpo_role=ORGANIZER",
          "x-xpo-user-id": ownedOrganizerId,
        },
        body: JSON.stringify({ pageSize: "LARGE" }),
      }),
      { params: Promise.resolve({ id: ownedEventId }) }
    );
    expect(org.status).toBe(403);

    await db.event.update({
      where: { id: ownedEventId },
      data: { pageSize: null },
    });
  });

  it("stores venue size through the admin venue path organizers cannot write", async () => {
    const res = await updateVenue(
      new Request(`http://localhost:3000/api/admin/venues/${venueId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ size: "SMALL" }),
      }) as never,
      { params: Promise.resolve({ id: venueId }) } as never
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.venue.size).toBe("SMALL");

    // Organizer API exposes no venue mutation: size travels admin paths only.
    const writerFiles: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === "route.ts") {
          const src = readFileSync(full, "utf8");
          if (src.includes("/venues/") || full.includes("organizer/venues")) {
            if (/\b(POST|PUT|PATCH|DELETE)\b/.test(src) && full.includes("organizer")) {
              writerFiles.push(full);
            }
          }
        }
      }
    };
    walk("src/app/api/organizer");
    const venueWriters = writerFiles.filter((f) => f.includes("venues"));
    expect(venueWriters).toEqual([]);
  });
});
