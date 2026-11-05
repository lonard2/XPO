import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { resolveEditorialBlurb } from "@/lib/discovery/editorial";
import { PATCH as updateBlurbRoute } from "@/app/api/admin/events/[id]/blurb/route";

describe("Admin API: Editorial blurb update endpoint", () => {
  const adminHeaders = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ADMIN",
  };
  const organizerHeaders = {
    "Content-Type": "application/json",
    Cookie: "xpo_role=ORGANIZER",
  };

  let targetEventId: string;
  let original: { editorialBlurb: string | null; editorialApproved: boolean };

  const callPatch = (id: string, body: unknown, headers: Record<string, string>) =>
    updateBlurbRoute(
      new Request(`http://localhost:3000/api/admin/events/${id}/blurb`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id }) }
    );

  beforeAll(async () => {
    await db.$connect();
    const event = await db.event.findFirst({
      orderBy: { startDate: "asc" },
    });
    if (!event) throw new Error("seeded event required");
    targetEventId = event.id;
    original = {
      editorialBlurb: event.editorialBlurb,
      editorialApproved: event.editorialApproved,
    };
  });

  afterAll(async () => {
    await db.event
      .update({
        where: { id: targetEventId },
        data: {
          editorialBlurb: original.editorialBlurb,
          editorialBlurbI18n: undefined,
          editorialApproved: original.editorialApproved,
        },
      })
      .catch(() => {});
    await db.$disconnect();
  });

  it("denies unauthenticated requests with 401", async () => {
    const res = await callPatch(
      targetEventId,
      { editorialBlurb: "Editors pick." },
      { "Content-Type": "application/json" }
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("denies non-admin roles with 403", async () => {
    const res = await callPatch(
      targetEventId,
      { editorialBlurb: "Editors pick." },
      organizerHeaders
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("rejects overlong blurbs with 400 and saves nothing", async () => {
    const res = await callPatch(
      targetEventId,
      { editorialBlurb: "x".repeat(281) },
      adminHeaders
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);

    const row = await db.event.findUnique({ where: { id: targetEventId } });
    expect(row?.editorialBlurb).not.toBe("x".repeat(281));
  });

  it("rejects unknown locale keys with 400", async () => {
    const res = await callPatch(
      targetEventId,
      { editorialBlurbI18n: { xx: "Xyz" } },
      adminHeaders
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("saves default, override, and approval on the happy path", async () => {
    const res = await callPatch(
      targetEventId,
      {
        editorialBlurb: "Editors pick: the flagship automation expo.",
        editorialBlurbI18n: { id: "Pilihan editor." },
        editorialApproved: true,
      },
      adminHeaders
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.event.editorialBlurb).toBe(
      "Editors pick: the flagship automation expo."
    );
    expect(json.event.editorialApproved).toBe(true);
    expect(
      resolveEditorialBlurb({
        approved: json.event.editorialApproved,
        blurb: json.event.editorialBlurb,
        i18n: json.event.editorialBlurbI18n as Record<string, string> | null,
        locale: "id",
      })
    ).toBe("Pilihan editor.");
  });

  it("saves text without publishing when unapproved", async () => {
    const res = await callPatch(
      targetEventId,
      { editorialBlurb: "Draft line.", editorialApproved: false },
      adminHeaders
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(
      resolveEditorialBlurb({
        approved: json.event.editorialApproved,
        blurb: json.event.editorialBlurb,
        i18n: json.event.editorialBlurbI18n as Record<string, string> | null,
        locale: "en",
      })
    ).toBeNull();
  });
});
