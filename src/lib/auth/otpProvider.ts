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

/** Log provider: server log in dev, in-memory outbox for tests. */
const logProvider: OtpProvider = {
  async send(entry) {
    testOutbox.push(entry);
    console.info(`[otp] code for ${entry.email} (${entry.purpose})`);
  },
};

export function setOtpProvider(provider: OtpProvider | null): void {
  override = provider;
}

function activeProvider(): OtpProvider {
  return override || logProvider;
}

export function readTestOtpOutbox(): OtpOutboxEntry[] {
  return [...testOutbox];
}

export function clearTestOtpOutbox(): void {
  testOutbox.length = 0;
}

export async function deliverOtp(email: string, code: string, purpose: string): Promise<void> {
  await activeProvider().send({ email, code, purpose, sentAt: new Date().toISOString() });
}
