import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";

const EMAIL = `pw-test-${Date.now()}@xpo.com`;
const PASSWORD = "Str0ng Test Pass!";

function req(body: any) {
  return new Request("http://localhost:3000/api/auth/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Password register and login", () => {
  afterAll(async () => {
    await db.session.deleteMany({ where: { user: { email: EMAIL } } }).catch(() => {});
    await db.user.delete({ where: { email: EMAIL } }).catch(() => {});
    await db.$disconnect();
  });

  it("registers with a hashed password and a fixed attendee role", async () => {
    const res = await registerRoute(
      req({ name: "Pw Probe", email: EMAIL, password: PASSWORD, role: "ADMIN" })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.user.email).toBe(EMAIL);
    expect(json.user.role).toBe("ATTENDEE");
    const row = await db.user.findUnique({ where: { email: EMAIL } });
    expect(row!.passwordHash).toMatch(/^scrypt\$/);
    expect(row!.passwordHash).not.toContain(PASSWORD);
  });

  it("rejects duplicates and weak passwords", async () => {
    const dup = await registerRoute(req({ name: "X", email: EMAIL, password: PASSWORD }));
    expect(dup.status).toBe(409);
    const weak = await registerRoute(
      req({ name: "X", email: `weak-${Date.now()}@xpo.com`, password: "short" })
    );
    expect(weak.status).toBe(400);
  });

  it("logs in with a session cookie", async () => {
    const res = await loginRoute(req({ email: EMAIL, password: PASSWORD }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("xpo_session=");
    expect(setCookie).toContain("HttpOnly");
    const json = await res.json();
    expect(json.user.email).toBe(EMAIL);
  });

  it("rejects wrong passwords generically and locks out after five failures", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await loginRoute(req({ email: EMAIL, password: "Wr0ng Password!" }));
      expect(res.status).toBe(401);
      expect((await res.json()).error).not.toContain("Wr0ng");
    }
    const locked = await loginRoute(req({ email: EMAIL, password: "Wr0ng Password!" }));
    expect(locked.status).toBe(423);
    const unknown = await loginRoute(
      req({ email: `nobody-${Date.now()}@xpo.com`, password: "Wr0ng Password!" })
    );
    expect(unknown.status).toBe(401);
  });
});
