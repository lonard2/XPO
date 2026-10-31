/**
 * Plain, institutional email copy. No emoji, no em dashes, no marketing tone:
 * these are transactional messages a delegate may forward to an assistant.
 *
 * Every interpolated value is escaped. Names and titles come from user input,
 * so an unescaped template would let a delegate inject markup into mail sent
 * to another address.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(value: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#0f172a;">${value}</p>`;
}

function shell(body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
    ${body}
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">XPO MICE</p>
  </div>
</body></html>`;
}

export interface OtpEmailInput {
  code: string;
  purpose: string;
}

export function renderOtpEmail({ code, purpose }: OtpEmailInput) {
  const action = purpose === "VERIFY_EMAIL" ? "verify your email address" : "sign in";
  const subject = `Your XPO code is ${code}`;
  const text = [
    `Use this code to ${action}: ${code}`,
    "",
    "It expires in 10 minutes and can be used once.",
    "If you did not request it, you can ignore this email.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Use this code to ${action}:`),
      `<p style="margin:0 0 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:28px;font-weight:700;letter-spacing:0.18em;color:#0f172a;">${escapeHtml(code)}</p>`,
      paragraph("It expires in 10 minutes and can be used once."),
      paragraph("If you did not request it, you can ignore this email."),
    ].join("")
  );
  return { subject, text, html };
}

export interface BookingConfirmationInput {
  attendeeName: string;
  eventTitle: string;
  datesText: string;
  venueText: string;
  tierName: string;
  bookingId: string;
  passUrl: string;
}

export function renderBookingConfirmation({
  attendeeName,
  eventTitle,
  datesText,
  venueText,
  tierName,
  bookingId,
  passUrl,
}: BookingConfirmationInput) {
  const subject = `Pass confirmed: ${eventTitle}`;
  const text = [
    `Hello ${attendeeName},`,
    "",
    `Your pass for ${eventTitle} is confirmed.`,
    "",
    `Date: ${datesText}`,
    `Venue: ${venueText}`,
    `Pass: ${tierName}`,
    `Reference: ${bookingId}`,
    "",
    `Open your pass: ${passUrl}`,
    "",
    "Show the QR code at the gate. It still works offline once the pass page has loaded.",
    "",
    "XPO MICE",
  ].join("\n");

  const row = (label: string, value: string, mono = false) =>
    `<tr><td style="padding:6px 0;color:#64748b;width:96px;">${label}</td><td style="padding:6px 0;${
      mono ? "font-family:ui-monospace,Menlo,monospace;" : ""
    }">${escapeHtml(value)}</td></tr>`;

  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(attendeeName)},`),
      paragraph(`Your pass for <strong>${escapeHtml(eventTitle)}</strong> is confirmed.`),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">
        ${row("Date", datesText)}
        ${row("Venue", venueText)}
        ${row("Pass", tierName)}
        ${row("Reference", bookingId, true)}
      </table>`,
      `<p style="margin:0 0 16px;"><a href="${escapeHtml(passUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">Open your pass</a></p>`,
      paragraph("Show the QR code at the gate. It still works offline once the pass page has loaded."),
    ].join("")
  );

  return { subject, text, html };
}
