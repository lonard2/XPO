import { createHmac, randomBytes } from "node:crypto";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { sendEmail, setEmailTransport, type EmailMessage } from "@/lib/email/transport";
import { POST as ingestWebhook } from "@/app/api/email/webhooks/route";
import { DELETE as unsuppress } from "@/app/api/email/suppressions/route";

const WEBHOOKS_URL = "http://localhost/api/email/webhooks";
const SUPPRESSIONS_URL = "http://localhost/api/email/suppressions";

describe("email operations", () => {
  const stamp = Date.now();
  const suppressedEmail = `suppressed-${stamp}@example.com`;
  let admin: any;
  let attendee: any;

  const asUser = (user: any, role = "ATTENDEE") => ({
    "Content-Type": "application/json",
    Cookie: `xpo_role=${role}`,
    "x-xpo-user-id": user.id,
  });

  const secretBytes = randomBytes(32);
  const secret = secretBytes.toString("base64");

  function signedRequest(body: unknown, keyBytes: Buffer = secretBytes) {
    const raw = JSON.stringify(body);
    const id = "msg_test_1";
    const timestamp = "1700000000";
    const sig = createHmac("sha256", keyBytes).update(`${id}.${timestamp}.${raw}`).digest("base64");
    return new Request(WEBHOOKS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": id,
        "svix-timestamp": timestamp,
        "svix-signature": `v1,${sig}`,
      },
      body: raw,
    });
  }

  beforeAll(async () => {
    await db.$connect();
    admin = await db.user.create({
      data: { email: `mail-admin-${stamp}@example.com`, name: "Mail Admin", role: "ADMIN" },
    });
    attendee = await db.user.create({
      data: { email: `mail-user-${stamp}@example.com`, name: "Mail User", role: "ATTENDEE" },
    });
    process.env.RESEND_WEBHOOK_SECRET = secret;
  });

  afterEach(() => {
    setEmailTransport(null);
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    await db.emailSuppression.deleteMany({
      where: { email: { contains: `${stamp}@example.com` } },
    });
    await db.user.deleteMany({
      where: { id: { in: [admin?.id, attendee?.id].filter(Boolean) as string[] } },
    });
    await db.$disconnect();
  });

  it("ingests a bounce into suppression and ignores unknown types", async () => {
    const res = await ingestWebhook(
      signedRequest({ type: "email.bounced", data: { to: [suppressedEmail] } })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).suppressed).toEqual([suppressedEmail]);

    const row = await db.emailSuppression.findUnique({ where: { email: suppressedEmail } });
    expect(row?.reason).toBe("HARDBOUNCE");
    expect(row?.source).toBe("resend-webhook");

    const ignored = await ingestWebhook(signedRequest({ type: "email.delivered", data: {} }));
    expect(ignored.status).toBe(200);
    expect((await ignored.json()).ignored).toBe("email.delivered");
  });

  it("rejects forged webhook signatures", async () => {
    const res = await ingestWebhook(
      signedRequest(
        { type: "email.bounced", data: { to: ["x@example.com"] } },
        randomBytes(32)
      )
    );
    expect(res.status).toBe(401);
  });

  it("refuses unauthenticated webhooks in production without a secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.RESEND_WEBHOOK_SECRET;
    const res = await ingestWebhook(
      new Request(WEBHOOKS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email.bounced", data: { to: ["x@example.com"] } }),
      })
    );
    expect(res.status).toBe(503);
    process.env.RESEND_WEBHOOK_SECRET = secret;
  });

  it("skips transactional mail to suppressed addresses but always sends OTP", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    await sendEmail({ to: suppressedEmail, subject: "Booking", text: "hi" });
    expect(sent).toHaveLength(0);

    await sendEmail({ to: suppressedEmail, subject: "Code", text: "123", category: "otp" });
    expect(sent).toHaveLength(1);
  });

  it("lets an admin lift a suppression, nobody else", async () => {
    const denied = await unsuppress(
      new Request(SUPPRESSIONS_URL, {
        method: "DELETE",
        headers: asUser(attendee),
        body: JSON.stringify({ email: suppressedEmail }),
      })
    );
    expect(denied.status).toBe(403);

    const bad = await unsuppress(
      new Request(SUPPRESSIONS_URL, {
        method: "DELETE",
        headers: asUser(admin, "ADMIN"),
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );
    expect(bad.status).toBe(400);

    const res = await unsuppress(
      new Request(SUPPRESSIONS_URL, {
        method: "DELETE",
        headers: asUser(admin, "ADMIN"),
        body: JSON.stringify({ email: suppressedEmail }),
      })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).removed).toBe(1);
    expect(
      await db.emailSuppression.findUnique({ where: { email: suppressedEmail } })
    ).toBeNull();
  });
});
