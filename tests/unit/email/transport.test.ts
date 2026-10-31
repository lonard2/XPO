import { describe, it, expect, afterEach, vi } from "vitest";
import {
  activeEmailTransport,
  sendEmail,
  setEmailTransport,
  emailFromAddress,
} from "@/lib/email/transport";

afterEach(() => {
  setEmailTransport(null);
  vi.unstubAllEnvs();
});

describe("email transport selection", () => {
  it("falls back to the log transport when nothing is configured", () => {
    const transport = activeEmailTransport();
    expect(transport.name).toBe("log");
    expect(transport.delivers).toBe(false);
  });

  it("selects Resend when a key is present", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    expect(activeEmailTransport().name).toBe("resend");
  });

  it("selects SMTP when a URL is present", () => {
    vi.stubEnv("SMTP_URL", "smtp://user:pass@localhost:1025");
    expect(activeEmailTransport().name).toBe("smtp");
  });

  it("honours an explicit provider over detected credentials", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_PROVIDER", "log");
    expect(activeEmailTransport().name).toBe("log");
  });

  it("prefers a test override", () => {
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async () => {},
    });
    expect(activeEmailTransport().name).toBe("test");
  });
});

describe("sendEmail", () => {
  it("refuses to pretend in production when no provider is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(
      sendEmail({ to: "a@b.co", subject: "s", text: "t" })
    ).rejects.toThrow(/No email provider is configured/);
  });

  it("does not throw in development without a provider", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(sendEmail({ to: "a@b.co", subject: "s", text: "t" })).resolves.toBeUndefined();
  });

  it("passes the message to the configured transport", async () => {
    const sent: Array<{ to: string; subject: string }> = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push({ to: message.to, subject: message.subject });
      },
    });

    await sendEmail({ to: "delegate@example.com", subject: "Hello", text: "Body" });
    expect(sent).toEqual([{ to: "delegate@example.com", subject: "Hello" }]);
  });
});

describe("sender address", () => {
  it("defaults to the platform address and honours EMAIL_FROM", () => {
    expect(emailFromAddress()).toMatch(/xpo\.events>$/);
    vi.stubEnv("EMAIL_FROM", "Events <events@example.com>");
    expect(emailFromAddress()).toBe("Events <events@example.com>");
  });
});
