import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import { POST as createVenue } from "@/app/api/admin/venues/route";
import { PUT as updateVenue } from "@/app/api/admin/venues/[id]/route";

function req(url: string, method: string, body: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Admin venues: halls with kind, specs, and id-preserving updates", () => {
  it("POST creates halls with kind and verified specs", async () => {
    const res = await createVenue(
      req("http://localhost:3000/api/admin/venues", "POST", {
        name: `Probe Venue ${Date.now()}`,
        regionId: "id",
        city: "Jakarta",
        address: "Probe Street 1",
        halls: [
          { name: "Probe Hall", kind: "HALL", capacity: 1000, floorAreaSqm: 2000, ceilingHeightM: 9, floorLoadKnM2: 12 },
          { name: "Probe Meeting", kind: "MEETING_ROOM", capacity: 50, floorAreaSqm: 100 },
          { name: "Probe Garbage", ceilingHeightM: "not-a-number", floorLoadKnM2: "NaN" },
        ],
      })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);

    const venueId = json.venue.id;
    try {
      const kinds = Object.fromEntries(json.venue.halls.map((h: any) => [h.name, h.kind]));
      expect(kinds["Probe Hall"]).toBe("HALL");
      expect(kinds["Probe Meeting"]).toBe("MEETING_ROOM");
      const hall = json.venue.halls.find((h: any) => h.name === "Probe Hall");
      expect(hall.ceilingHeightM).toBe(9);
      expect(hall.floorLoadKnM2).toBe(12);
      const garbage = json.venue.halls.find((h: any) => h.name === "Probe Garbage");
      expect(garbage.ceilingHeightM).toBeNull();
      expect(garbage.floorLoadKnM2).toBeNull();

      // PUT keeps surviving hall ids, updates kind, drops removed rows.
      const keepId = hall.id;
      const putRes = await updateVenue(
        req(`http://localhost:3000/api/admin/venues/${venueId}`, "PUT", {
          halls: [
            { id: keepId, name: "Probe Hall", kind: "MEETING_ROOM", capacity: 1000, floorAreaSqm: 2000 },
            { name: "Probe New", kind: "HALL" },
          ],
        }),
        { params: Promise.resolve({ id: venueId }) }
      );
      expect(putRes.status).toBe(200);
      const putJson = await putRes.json();
      expect(putJson.venue.halls.length).toBe(2);
      const kept = putJson.venue.halls.find((h: any) => h.id === keepId);
      expect(kept).toBeDefined();
      expect(kept.kind).toBe("MEETING_ROOM");
      expect(putJson.venue.halls.some((h: any) => h.name === "Probe Meeting")).toBe(false);
    } finally {
      await db.venueHall.deleteMany({ where: { venueId } });
      await db.venue.delete({ where: { id: venueId } }).catch(() => {});
    }
  });
});
