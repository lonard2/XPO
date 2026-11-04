import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { GET as getProfile, PATCH as patchProfile } from "@/app/api/profile/route";
import { GET as getSuggestions } from "@/app/api/profile/suggestions/route";
import { buildRerankSignals } from "@/lib/matching/rerank";

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

  // Each test starts from known interests: the suite mutates them throughout.
  beforeEach(async () => {
    await db.user.update({
      where: { id: user.id },
      data: { interestsJson: JSON.stringify(["TECH_DEV_SUMMIT", "MEDIA_BROADCAST"]) },
    });
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

  it("falls back to rules without a live key and exposes limit headers", async () => {
    const res = await getSuggestions(
      new Request(`${BASE}/suggestions?rerank=true`, { headers: asUser(user.id) })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.rankedBy).toBe("rules");
    expect(json.suggestions.length).toBeGreaterThan(0);
    expect(json.suggestions[0].reason).toContain("TECH_DEV_SUMMIT");
    expect(res.headers.get("x-ratelimit-limit")).toBe("10");
  });

  it("rejects an unknown model", async () => {
    const res = await getSuggestions(
      new Request(`${BASE}/suggestions?rerank=true&model=nope`, { headers: asUser(user.id) })
    );
    expect(res.status).toBe(400);
  });

  it("reorders through the model and drops invented ids", async () => {
    process.env.OPENROUTER_API_KEY = "live-test-key-long-enough";
    const realFetch = globalThis.fetch;
    const completion = (rankings: Array<{ eventId: string; reason: string }>) => ({
      choices: [{ message: { content: JSON.stringify({ rankings }) } }],
    });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(completion([{ eventId: "ev-placeholder", reason: "x" }])),
    }) as any;
    try {
      const first = await getSuggestions(
        new Request(`${BASE}/suggestions`, { headers: asUser(user.id) })
      );
      const firstJson = await first.json();
      const topId = firstJson.suggestions[0].event.id;
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(
            completion([
              { eventId: "ev-invented", reason: "Not real." },
              { eventId: topId, reason: "Top pick for your interests." },
            ])
          ),
      });
      const res = await getSuggestions(
        new Request(`${BASE}/suggestions?rerank=true`, { headers: asUser(user.id) })
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.rankedBy).toBe("ai");
      expect(json.modelUsed).toBe("google/gemini-3.5-flash-lite");
      const ids = json.suggestions.map((s: any) => s.event.id);
      expect(ids).not.toContain("ev-invented");
      expect(ids[0]).toBe(topId);
      expect(json.suggestions[0].reason).toBe("Top pick for your interests.");
    } finally {
      globalThis.fetch = realFetch;
      delete process.env.OPENROUTER_API_KEY;
    }
  });

  it("feeds meeting outcomes into the rerank signals", async () => {
    const venue = await db.venue.findFirst();
    const outcomeEvent = await db.event.create({
      data: {
        regionId: "id",
        venueId: venue!.id,
        title: `Outcome Event ${stamp}`,
        slug: `outcome-event-${stamp}`,
        description: "Signal coverage.",
        startDate: new Date("2027-10-01T09:00:00Z"),
        endDate: new Date("2027-10-02T18:00:00Z"),
      },
    });
    try {
      await db.meetingRequest.create({
        data: {
          eventId: outcomeEvent.id,
          type: "DEAL_SLOT",
          requesterName: "M3",
          requesterEmail: "m3@example.com",
          requesterId: user.id,
          status: "CONFIRMED",
        },
      });
      const signals = await buildRerankSignals(user.id);
      expect(signals.meetingOutcomes).toContainEqual({
        type: "DEAL_SLOT",
        status: "CONFIRMED",
        count: 1,
      });
      expect(signals.interests).toContain("TECH_DEV_SUMMIT");
    } finally {
      await db.meetingRequest.deleteMany({ where: { eventId: outcomeEvent.id } });
      await db.event.deleteMany({ where: { id: outcomeEvent.id } });
    }
  });
});
