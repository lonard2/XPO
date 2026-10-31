export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailTransport {
  readonly name: string;
  /** Whether this transport can actually deliver. The log transport cannot. */
  readonly delivers: boolean;
  send(message: EmailMessage): Promise<void>;
}

const DEFAULT_FROM = "XPO MICE <no-reply@xpo.events>";

export function emailFromAddress(): string {
  return process.env.EMAIL_FROM || DEFAULT_FROM;
}

let override: EmailTransport | null = null;

/** Test seam: replace the transport for a suite, then reset with null. */
export function setEmailTransport(transport: EmailTransport | null): void {
  override = transport;
}

const logTransport: EmailTransport = {
  name: "log",
  delivers: false,
  async send(message) {
    // Never log the body: it can contain a one-time code.
    console.info(`[email] not configured, skipping ${message.subject} to ${message.to}`);
  },
};

const resendTransport: EmailTransport = {
  name: "resend",
  delivers: true,
  async send(message) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFromAddress(),
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
      }),
    });
    if (!response.ok) {
      throw new Error(`Resend rejected the message with status ${response.status}`);
    }
  },
};

let smtpClient: unknown = null;

const smtpTransport: EmailTransport = {
  name: "smtp",
  delivers: true,
  async send(message) {
    const url = process.env.SMTP_URL;
    if (!url) throw new Error("SMTP_URL is not set");
    // Imported lazily so the module stays light when SMTP is not in use.
    const nodemailer = await import("nodemailer");
    if (!smtpClient) {
      smtpClient = nodemailer.createTransport(url);
    }
    const client = smtpClient as { sendMail: (options: Record<string, unknown>) => Promise<unknown> };
    await client.sendMail({
      from: emailFromAddress(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
    });
  },
};

function selectTransport(): EmailTransport {
  if (override) return override;
  const configured = process.env.EMAIL_PROVIDER?.toLowerCase();
  if (configured === "resend") return resendTransport;
  if (configured === "smtp") return smtpTransport;
  if (configured === "log") return logTransport;
  if (process.env.RESEND_API_KEY) return resendTransport;
  if (process.env.SMTP_URL) return smtpTransport;
  return logTransport;
}

export function activeEmailTransport(): EmailTransport {
  return selectTransport();
}

/**
 * Send one message. In production an unconfigured transport is an error rather
 * than a silent no-op, because the alternative is a user waiting for a code
 * that was never sent.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const transport = selectTransport();
  if (!transport.delivers && process.env.NODE_ENV === "production") {
    throw new Error("No email provider is configured (set RESEND_API_KEY or SMTP_URL).");
  }
  await transport.send(message);
}
