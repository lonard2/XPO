import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { POST as requestRoute } from "@/app/api/auth/otp/request/route";
import { POST as verifyRoute } from "@/app/api/auth/otp/verify/route";
import { readTestOtpOutbox, clearTestOtpOutbox } from "@/lib/auth/otpProvider";

const EMAIL = `otp-test-${Date.now()}@xpo.com`;

function req(body: any) {
  return new Request("http://localhost:3000/api/auth/otp/x", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Email OTP login", () => {
  afterAll(async () => {
    await db.otpCode.deleteMany({ where: { email: EMAIL } }).catch(() => {});
    await db.session.deleteMany({ where: { user: { email: EMAIL } } }).catch(() => {});
    await db.user.deleteMany({ where: { email: EMAIL } }).catch(() => {});
    await db.$disconnect();
  });

  it("requests a code and verifies into a session, creating the user", async () => {
    clearTestOtpOutbox();
    const r = await requestRoute(req({ email: EMAIL }));
    expect(r.status).toBe(200);
    const outbox = readTestOtpOutbox();
    expect(outbox.length).toBe(1);
    expect(outbox[0].email).toBe(EMAIL);
    expect(outbox[0].code).toMatch(/^\d{6}$/);

    const v = await verifyRoute(req({ email: EMAIL, code: outbox[0].code }));
    expect(v.status).toBe(200);
    expect((v.headers.get("set-cookie") || "")).toContain("xpo_session=");
    const json = await v.json();
    expect(json.user.email).toBe(EMAIL);
    expect(json.user.role).toBe("ATTENDEE");

    const row = await db.user.findUnique({ where: { email: EMAIL } });
    expect(row!.emailVerifiedAt).not.toBeNull();
  });

  it("stays generic for unknown emails and rejects bad codes", async () => {
    const r = await requestRoute(req({ email: `ghost-${Date.now()}@xpo.com` }));
    expect(r.status).toBe(200);

    const bad = await verifyRoute(req({ email: EMAIL, code: "000000" }));
    expect(bad.status).toBe(401);
  });

  it("locks out after five wrong attempts", async () => {
    const email = `otp-lock-${Date.now()}@xpo.com`;
    try {
      await requestRoute(req({ email }));
      for (let i = 0; i < 5; i++) {
        const res = await verifyRoute(req({ email, code: "111111" }));
        expect(res.status).toBe(401);
      }
      const locked = await verifyRoute(req({ email, code: "111111" }));
      expect(locked.status).toBe(423);
    } finally {
      await db.otpCode.deleteMany({ where: { email } }).catch(() => {});
    }
  });
});
