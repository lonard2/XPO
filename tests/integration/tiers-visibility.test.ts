import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { db } from "@/lib/db";

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "ja", "zh-CN", "id", "de", "es"] },
}));

import {
  resolveDetailVisibility,
  listingWhere,
} from "@/lib/discovery/presentation";
import sitemap from "@/app/sitemap";
import { GET as getSuggestions } from "@/app/api/profile/suggestions/route";
import { GET as getPublicEvent } from "@/app/api/events/[id]/route";

describe("Tiers: visibility enforcement and leak tests", () => {
  const stamp = Date.now();
  let venueId: string;
  let discreetSlug: string;
  let hiddenSlug: string;
  let userId: string;

  beforeAll(async () => {
    await db.$connect();
    const venue = await db.venue.findFirst({ select: { id: true } });
    if (!venue) throw new Error("seeded venue required");
    venueId = venue.id;
    discreetSlug = `discreet-probe-${stamp}`;
    hiddenSlug = `hidden-probe-${stamp}`;
    const start = new Date(Date.now() + 86400000 * 30);
    const end = new Date(Date.now() + 86400000 * 32);
    await db.event.createMany({
      data: [
        {
          title: "Discreet Corporate Showcase",
          slug: discreetSlug,
          description: "Unannounced.",
          venueId,
          regionId: "id",
          startDate: start,
          endDate: end,
          archetype: "INDUSTRIAL_B2B",
          visibility: "DISCREET",
        },
        {
          title: "Hidden Board Retreat",
          slug: hiddenSlug,
          description: "Invite only.",
          venueId,
          regionId: "id",
          startDate: start,
          endDate: end,
          archetype: "INCENTIVE_RETREAT",
          visibility: "HIDDEN",
        },
      ],
    });
    const user = await db.user.create({
      data: {
        email: `tiers-${stamp}@example.com`,
        name: "Tiers Prober",
        role: "ATTENDEE",
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await db.event.deleteMany({ where: { slug: { in: [discreetSlug, hiddenSlug] } } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  });

  it("routes detail visibility by tier", () => {
    expect(resolveDetailVisibility("PUBLIC")).toBe("render");
    expect(resolveDetailVisibility("DISCREET")).toBe("notFound");
    expect(resolveDetailVisibility("HIDDEN")).toBe("unlisted");
    expect(resolveDetailVisibility(null)).toBe("render");
  });

  it("excludes discreet and hidden slugs from the sitemap", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes(discreetSlug))).toBe(false);
    expect(urls.some((u) => u.includes(hiddenSlug))).toBe(false);
  });

  it("excludes discreet and hidden events from suggestions", async () => {
    const res = await getSuggestions(
      new Request("http://localhost:3000/api/profile/suggestions", {
        headers: {
          "Content-Type": "application/json",
          Cookie: "xpo_role=ATTENDEE",
          "x-xpo-user-id": userId,
        },
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const text = JSON.stringify(json);
    expect(text).not.toContain("Discreet Corporate Showcase");
    expect(text).not.toContain("Hidden Board Retreat");
  });

  it("refuses discreet and hidden events from the public event API", async () => {
    const anon = { "Content-Type": "application/json" };
    for (const slug of [discreetSlug, hiddenSlug]) {
      const res = await getPublicEvent(
        new Request(`http://localhost:3000/api/events/${slug}`, { headers: anon }) as never,
        { params: Promise.resolve({ id: slug }) }
      );
      expect(res.status).toBe(404);
      expect(JSON.stringify(await res.json())).not.toContain("Corporate Showcase");
    }
  });

  it("still serves public events and owned non-public events with identity", async () => {
    const publicEvent = await db.event.findFirst({
      where: { visibility: "PUBLIC" },
      select: { id: true, title: true },
    });
    const open = await getPublicEvent(
      new Request(`http://localhost:3000/api/events/${publicEvent!.id}`, {
        headers: { "Content-Type": "application/json" },
      }) as never,
      { params: Promise.resolve({ id: publicEvent!.id }) }
    );
    expect(open.status).toBe(200);

    const owned = await db.event.findFirst({
      where: { organizerId: { not: null } },
      select: { id: true, organizerId: true },
    });
    await db.event.update({
      where: { id: owned!.id },
      data: { visibility: "HIDDEN" },
    });
    try {
      const ownerRes = await getPublicEvent(
        new Request(`http://localhost:3000/api/events/${owned!.id}`, {
          headers: {
            "Content-Type": "application/json",
            Cookie: "xpo_role=ORGANIZER",
            "x-xpo-user-id": owned!.organizerId!,
          },
        }) as never,
        { params: Promise.resolve({ id: owned!.id }) }
      );
      expect(ownerRes.status).toBe(200);
      expect(JSON.stringify(await ownerRes.json())).toContain(owned!.id);
    } finally {
      await db.event.update({
        where: { id: owned!.id },
        data: { visibility: "PUBLIC" },
      });
    }
  });

  it("wires the listing filter into every public query", () => {
    expect(listingWhere()).toEqual({ visibility: "PUBLIC" });
    const sources = [
      "src/app/sitemap.ts",
      "src/app/[locale]/(attendee)/page.tsx",
      "src/app/[locale]/(attendee)/events/page.tsx",
      "src/app/[locale]/(attendee)/calendar/page.tsx",
      "src/app/[locale]/(attendee)/venues/[slug]/page.tsx",
      "src/app/api/profile/suggestions/route.ts",
    ]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    expect(sources).toContain("listingWhere");
  });

  it("filters the homepage venue rail's nested events too", () => {
    const page = readFileSync(
      "src/app/[locale]/(attendee)/page.tsx",
      "utf8"
    );
    const lines = page.split("\n");
    const idx = lines.findIndex((line) => line.trim() === "events: {");
    expect(idx).toBeGreaterThan(-1);
    const block = lines.slice(idx, idx + 4).join("\n");
    expect(block).toContain("listingWhere");
  });
});

describe("Quality Gate: discreet dictionary usage", () => {
  it("every discreet label key exists in all six locales", () => {
    const source = readFileSync(
      "src/components/discovery/VenueScheduleTable.tsx",
      "utf8"
    );
    const missing: string[] = [];
    for (const match of source.matchAll(/\btCom\('([^']+)'\)/g)) {
      if (!match[1].startsWith("discreet")) continue;
      for (const locale of ["en", "id", "ja", "zh-CN", "de", "es"]) {
        const parsed = JSON.parse(
          readFileSync(`src/messages/${locale}.json`, "utf8")
        ) as Record<string, Record<string, unknown>>;
        if (!(match[1] in (parsed.common ?? {})))
          missing.push(`${locale}.common.${match[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
