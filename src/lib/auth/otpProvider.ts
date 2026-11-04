import { activeEmailTransport, sendEmail } from "@/lib/email/transport";
import { renderOtpEmail } from "@/lib/email/templates";

export interface OtpOutboxEntry {
  email: string;
  code: string;
  purpose: string;
  sentAt: string;
}

export interface OtpProvider {
  send(entry: OtpOutboxEntry): Promise<void>;
}

const testOutbox: OtpOutboxEntry[] = [];
let override: OtpProvider | null = null;

/** Test seam: replace delivery for a suite, then reset with null. */
export function setOtpProvider(provider: OtpProvider | null): void {
  override = provider;
}

export function readTestOtpOutbox(): OtpOutboxEntry[] {
  return [...testOutbox];
}

export function clearTestOtpOutbox(): void {
  testOutbox.length = 0;
}

/**
 * Deliver a login code through the configured email transport.
 *
 * Without a provider the code goes to the server log in development and the
 * test outbox, which keeps local sign-in working. In production `sendEmail`
 * throws instead, because a silently dropped code is a locked-out user.
 */
export async function deliverOtp(email: string, code: string, purpose: string): Promise<void> {
  const entry: OtpOutboxEntry = { email, code, purpose, sentAt: new Date().toISOString() };

  if (override) {
    await override.send(entry);
    return;
  }

  if (!activeEmailTransport().delivers) {
    testOutbox.push(entry);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[otp] code for ${email} (${purpose})`);
    }
  }

  const { subject, text, html } = renderOtpEmail({ code, purpose });
  // OTP bypasses suppression: a suppressed code is a locked-out user.
  await sendEmail({ to: email, subject, text, html, category: "otp" });
}
