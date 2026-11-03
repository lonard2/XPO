import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  POST as claimBooth,
  PATCH as decideClaim,
  DELETE as withdrawClaim,
} from "@/app/api/exhibitor/booths/[id]/claim/route";
import { PATCH as updateProfile } from "@/app/api/exhibitor/booths/[id]/route";

const BASE = "http://localhost/api/exhibitor/booths";

describe("booth claiming and exhibitor profile", () => {
  const stamp = Date.now();
  let organizer: any;
  let otherOrganizer: any;
  let claimant: any;
  let otherClaimant: any;
  let event: any;
  let booth: any;
  let secondBooth: any;

  const asUser = (user: any, role = "ATTENDEE") => ({
    "Content-Type": "application/json",
    Cookie: `xpo_role=${role}`,
    "x-xpo-user-id": user.id,
  });

  const claim = (id: string, headers: Record<string, string>) =>
    claimBooth(new Request(`${BASE}/${id}/claim`, { method: "POST", headers }), {
      params: Promise.resolve({ id }),
    });

  const decide = (id: string, headers: Record<string, string>, status: string) =>
    decideClaim(
      new Request(`${BASE}/${id}/claim`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      }),
      { params: Promise.resolve({ id }) }
    );

  const withdraw = (id: string, headers: Record<string, string>) =>
    withdrawClaim(new Request(`${BASE}/${id}/claim`, { method: "DELETE", headers }), {
      params: Promise.resolve({ id }),
    });

  const edit = (id: string, headers: Record<string, string>, body: Record<string, unknown>) =>
    updateProfile(
      new Request(`${BASE}/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id }) }
    );

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();

    organizer = await db.user.create({
      data: { email: `claim-org-${stamp}@example.com`, name: "Claim Organizer", role: "ORGANIZER" },
    });
    otherOrganizer = await db.user.create({
      data: { email: `claim-org2-${stamp}@example.com`, name: "Other Organizer", role: "ORGANIZER" },
    });
    claimant = await db.user.create({
      data: { email: `claim-user-${stamp}@example.com`, name: "Booth Claimant", role: "ATTENDEE" },
    });
    otherClaimant = await db.user.create({
      data: { email: `claim-user2-${stamp}@example.com`, name: "Other Claimant", role: "ATTENDEE" },
    });

    event = await db.event.create({
      data: {
        organizerId: organizer.id,
        regionId: "id",
        venueId: venue!.id,
        title: `Claim Event ${stamp}`,
        slug: `claim-event-${stamp}`,
        description: "Booth claim coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    booth = await db.boothTenant.create({
      data: {
        eventId: event.id,
        companyName: "Claimable Robotics",
        boothNumber: "C-01",
        hallName: "Hall C",
      },
    });
    secondBooth = await db.boothTenant.create({
      data: {
        eventId: event.id,
        companyName: "Second Robotics",
        boothNumber: "C-02",
        hallName: "Hall C",
      },
    });
  });

  afterAll(async () => {
    await db.boothTenant.deleteMany({ where: { eventId: event?.id } });
    await db.event.deleteMany({ where: { id: event?.id } });
    await db.user.deleteMany({
      where: {
        id: {
          in: [organizer?.id, otherOrganizer?.id, claimant?.id, otherClaimant?.id].filter(
            Boolean
          ) as string[],
        },
      },
    });
    await db.$disconnect();
  });

  it("claims an unclaimed booth and is idempotent for the same user", async () => {
    const first = await claim(booth.id, asUser(claimant));
    expect(first.status).toBe(201);
    expect((await first.json()).booth.claimStatus).toBe("PENDING");

    const again = await claim(booth.id, asUser(claimant));
    expect(again.status).toBe(200);
  });

  it("refuses a second claimant while the first is pending", async () => {
    const res = await claim(booth.id, asUser(otherClaimant));
    expect(res.status).toBe(409);
  });

  it("refuses approval from an organizer who does not own the event", async () => {
    const res = await decide(booth.id, asUser(otherOrganizer, "ORGANIZER"), "CLAIMED");
    expect(res.status).toBe(403);
  });

  it("approves the claim for the owning organizer", async () => {
    const res = await decide(booth.id, asUser(organizer, "ORGANIZER"), "CLAIMED");
    expect(res.status).toBe(200);
    const stored = await db.boothTenant.findUnique({ where: { id: booth.id } });
    expect(stored?.claimStatus).toBe("CLAIMED");
    expect(stored?.userId).toBe(claimant.id);
    expect(stored?.claimedAt).toBeTruthy();
  });

  it("lets the claimant edit the public profile but not the allocation", async () => {
    const res = await edit(booth.id, asUser(claimant), {
      companyName: "Claimable Robotics Updated",
      description: "Precision robotics.",
      websiteUrl: "https://example.com/robotics",
      logoUrl: "https://example.com/logo.png",
      dimensions: "6m x 3m",
      areaSqm: 18,
      boothType: "ISLAND",
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.booth.companyName).toBe("Claimable Robotics Updated");
    expect(json.booth.areaSqm).toBe(18);

    const stored = await db.boothTenant.findUnique({ where: { id: booth.id } });
    expect(stored?.boothNumber).toBe("C-01");
    expect(stored?.hallName).toBe("Hall C");
  });

  it("ignores an attempt to change the booth number", async () => {
    const res = await edit(booth.id, asUser(claimant), { boothNumber: "HACKED-1" });
    expect(res.status).toBe(400);
    const stored = await db.boothTenant.findUnique({ where: { id: booth.id } });
    expect(stored?.boothNumber).toBe("C-01");
  });

  it("refuses profile edits from another user", async () => {
    const res = await edit(booth.id, asUser(otherClaimant), { description: "Not mine." });
    expect(res.status).toBe(403);
  });

  it("lets a pending claimant withdraw and another user claim afterwards", async () => {
    await claim(secondBooth.id, asUser(otherClaimant));
    const withdrawn = await withdraw(secondBooth.id, asUser(otherClaimant));
    expect(withdrawn.status).toBe(200);

    const stored = await db.boothTenant.findUnique({ where: { id: secondBooth.id } });
    expect(stored?.claimStatus).toBe("UNCLAIMED");
    expect(stored?.userId).toBeNull();

    const reclaimed = await claim(secondBooth.id, asUser(claimant));
    expect(reclaimed.status).toBe(201);
  });

  it("clears the claimant when the organizer rejects", async () => {
    const res = await decide(secondBooth.id, asUser(organizer, "ORGANIZER"), "REJECTED");
    expect(res.status).toBe(200);
    const stored = await db.boothTenant.findUnique({ where: { id: secondBooth.id } });
    expect(stored?.claimStatus).toBe("REJECTED");
    expect(stored?.userId).toBeNull();
  });
});
