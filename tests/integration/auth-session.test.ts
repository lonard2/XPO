import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { sha256hex } from "@/lib/auth/password";
import { GET as meRoute } from "@/app/api/auth/me/route";
import { POST as logoutRoute } from "@/app/api/auth/logout/route";

describe("Session lifecycle", () => {
  let userId: string;
  let token: string;

  beforeAll(async () => {
    await db.$connect();
    const user = await db.user.create({
      data: { email: `sess-test-${Date.now()}@xpo.com`, name: "Session Probe", role: "ORGANIZER" },
    });
    userId = user.id;
    const { createSession } = await import("@/lib/auth/sessionStore");
    token = await createSession(userId, {});
  });

  afterAll(async () => {
    await db.session.deleteMany({ where: { userId } }).catch(() => {});
    await db.user.delete({ where: { id: userId } }).catch(() => {});
    await db.$disconnect();
  });

  it("resolves the current user from a session cookie", async () => {
    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { Cookie: `xpo_session=${token}` },
    });
    const res = await meRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user.id).toBe(userId);
  });

  it("rejects missing, forged, and expired sessions with 401", async () => {
    const anon = await meRoute(new Request("http://localhost:3000/api/auth/me"));
    expect(anon.status).toBe(401);

    const forged = await meRoute(
      new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: "xpo_session=forged-token-value" },
      })
    );
    expect(forged.status).toBe(401);

    const { createSession } = await import("@/lib/auth/sessionStore");
    const short = await createSession(userId, { ttlMs: -1000 });
    const expired = await meRoute(
      new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: `xpo_session=${short}` },
      })
    );
    expect(expired.status).toBe(401);
  });

  it("never stores the raw token, only its hash", async () => {
    const rows = await db.session.findMany({ where: { userId } });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.tokenHash).toBe(sha256hex(token));
      expect(row.tokenHash).not.toContain(token.slice(0, 8));
    }
  });

  it("revokes on logout and clears the cookie", async () => {
    const req = new Request("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: { Cookie: `xpo_session=${token}` },
    });
    const res = await logoutRoute(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie") || "").toContain("xpo_session=;");
    const again = await meRoute(
      new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: `xpo_session=${token}` },
      })
    );
    expect(again.status).toBe(401);
  });
});
