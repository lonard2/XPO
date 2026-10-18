import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PATCH as patchShowcase } from "@/app/api/organizer/events/[id]/showcase/route";

function req(url: string, body: unknown, role?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (role) headers.Cookie = `xpo_role=${role}`;
  return new NextRequest(url, { method: "PATCH", headers, body: JSON.stringify(body) });
}

describe("showcase PATCH ownership and validation", () => {
  it("denies non-owners and strangers, validates rows, stores for owners", async () => {
    const seed = await db.event.findFirst({ select: { id: true, organizerId: true } });
    expect(seed).toBeDefined();

    // Stranger organizer denied on a real event (demo cookie id owns nothing).
    const denied = await patchShowcase(
      req(`http://localhost:3000/api/organizer/events/${seed!.id}/showcase`, {
        alerts: ["Hi"],
      }, "ORGANIZER"),
      { params: Promise.resolve({ id: seed!.id }) }
    );
    expect(denied.status).toBe(403);

    // Invalid rows rejected even for admin.
    const invalid = await patchShowcase(
      req(`http://localhost:3000/api/organizer/events/${seed!.id}/showcase`, {
        livestreamUrl: "not a url",
      }, "ADMIN"),
      { params: Promise.resolve({ id: seed!.id }) }
    );
    expect(invalid.status).toBe(400);

    // Missing event is 404.
    const missing = await patchShowcase(
      req("http://localhost:3000/api/organizer/events/nope-zzz/showcase", {}, "ADMIN"),
      { params: Promise.resolve({ id: "nope-zzz" }) }
    );
    expect(missing.status).toBe(404);

    // Real owner stores valid content, then cleans up after itself.
    const ownerReq = new NextRequest(
      `http://localhost:3000/api/organizer/events/${seed!.id}/showcase`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-xpo-user-role": "ORGANIZER",
          "x-xpo-user-id": seed!.organizerId || "nobody",
        },
        body: JSON.stringify({ alerts: ["Probe alert"] }),
      }
    );
    const stored = await patchShowcase(ownerReq, { params: Promise.resolve({ id: seed!.id }) });
    expect(stored.status).toBe(200);
    const storedJson = await stored.json();
    expect(JSON.parse(storedJson.event.showcaseJson).alerts).toEqual(["Probe alert"]);

    await db.event.update({
      where: { id: seed!.id },
      data: { showcaseJson: null },
    });
  });
});
