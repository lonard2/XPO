import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { GET as getProfile, PATCH as patchProfile } from "@/app/api/profile/route";
import { GET as getSuggestions } from "@/app/api/profile/suggestions/route";

const BASE = "http://localhost/api/profile";

describe("profile persistence and suggestions", () => {
  const stamp = Date.now();
  let user: any;

  const asUser = (id: string) => ({
    "Content-Type": "application/json",
    Cookie: "xpo_role=ATTENDEE",
    "x-xpo-user-id": id,
  });

  beforeAll(async () => {
    await db.$connect();
    user = await db.user.create({
      data: {
        email: `profile-${stamp}@example.com`,
        name: "Profile Holder",
        role: "ATTENDEE",
      },
    });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { id: user?.id } });
    await db.$disconnect();
  });

  it("rejects anonymous reads and writes with 401", async () => {
    expect((await getProfile(new Request(BASE))).status).toBe(401);
    expect(
      (
        await patchProfile(
          new Request(BASE, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName: "Nobody" }),
          })
        )
      ).status
    ).toBe(401);
    expect((await getSuggestions(new Request(`${BASE}/suggestions`))).status).toBe(401);
  });

  it("round-trips interests and profile fields to the database", async () => {
    const res = await patchProfile(
      new Request(BASE, {
        method: "PATCH",
        headers: asUser(user.id),
        body: JSON.stringify({
          fullName: "Profile Holder Updated",
          organization: "Match Labs",
          jobTitle: "Buyer",
          interests: ["TECH_DEV_SUMMIT", "MEDIA_BROADCAST"],
        }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.profile.fullName).toBe("Profile Holder Updated");
    expect(json.profile.interests).toEqual(["TECH_DEV_SUMMIT", "MEDIA_BROADCAST"]);

    const stored = await db.user.findUnique({ where: { id: user.id } });
    expect(JSON.parse(stored!.interestsJson)).toEqual([
      "TECH_DEV_SUMMIT",
      "MEDIA_BROADCAST",
    ]);
    expect(stored?.organization).toBe("Match Labs");

    const reread = await getProfile(new Request(BASE, { headers: asUser(user.id) }));
    expect((await reread.json()).profile.interests).toEqual([
      "TECH_DEV_SUMMIT",
      "MEDIA_BROADCAST",
    ]);
  });

  it("drops unknown interest ids instead of storing them", async () => {
    const res = await patchProfile(
      new Request(BASE, {
        method: "PATCH",
        headers: asUser(user.id),
        body: JSON.stringify({ interests: ["TECH_DEV_SUMMIT", "NOT_A_CATEGORY"] }),
      })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).profile.interests).toEqual(["TECH_DEV_SUMMIT"]);
  });

  it("rejects empty names and empty payloads", async () => {
    const empty = await patchProfile(
      new Request(BASE, {
        method: "PATCH",
        headers: asUser(user.id),
        body: JSON.stringify({ fullName: "  " }),
      })
    );
    expect(empty.status).toBe(400);

    const none = await patchProfile(
      new Request(BASE, { method: "PATCH", headers: asUser(user.id), body: JSON.stringify({}) })
    );
    expect(none.status).toBe(400);
  });

  it("suggests matching upcoming events with reasons, never listings", async () => {
    const res = await getSuggestions(
      new Request(`${BASE}/suggestions`, { headers: asUser(user.id) })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.suggestions)).toBe(true);
    for (const suggestion of json.suggestions) {
      expect(suggestion.score).toBeGreaterThan(0);
      expect(suggestion.matchedInterests.length).toBeGreaterThan(0);
      expect(suggestion.event.slug).toBeDefined();
    }
    const archetypes = json.suggestions.map((s: any) => s.event.archetype);
    expect(archetypes).toContain("TECH_DEV_SUMMIT");
  });

  it("returns no suggestions when the user stored none", async () => {
    await patchProfile(
      new Request(BASE, {
        method: "PATCH",
        headers: asUser(user.id),
        body: JSON.stringify({ interests: [] }),
      })
    );
    const res = await getSuggestions(
      new Request(`${BASE}/suggestions`, { headers: asUser(user.id) })
    );
    expect((await res.json()).suggestions).toEqual([]);
  });
});
