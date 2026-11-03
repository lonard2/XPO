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

const row = (label: string, value: string, mono = false) =>
  `<tr><td style="padding:6px 0;color:#64748b;width:96px;">${label}</td><td style="padding:6px 0;${
    mono ? "font-family:ui-monospace,Menlo,monospace;" : ""
  }">${escapeHtml(value)}</td></tr>`;

export interface OtpEmailInput {
  code: string;
  purpose: string;
}

function shell(body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
    ${body}
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">XPO MICE</p>
  </div>
</body></html>`;
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

export type MeetingRequestType =
  | "RFQ"
  | "DEAL_SLOT"
  | "BUYER_APPOINTMENT"
  | "BILATERAL_SLOT"
  | "DEAL_ROOM";

const MEETING_TYPE_LABEL: Record<MeetingRequestType, string> = {
  RFQ: "Request for Quotation",
  DEAL_SLOT: "B2B deal-room slot",
  BUYER_APPOINTMENT: "Buyer appointment",
  BILATERAL_SLOT: "Bilateral dialogue slot",
  DEAL_ROOM: "Private deal-room meeting",
};

export interface MeetingRequestEmailInput {
  type: MeetingRequestType;
  eventTitle: string;
  requesterName: string;
  target: string;
  slot: string;
  message: string;
  reference: string;
}

function meetingLines(input: MeetingRequestEmailInput): string[] {
  const lines = [
    `Type: ${MEETING_TYPE_LABEL[input.type]}`,
    `Event: ${input.eventTitle}`,
    `From: ${input.requesterName}`,
  ];
  if (input.target) lines.push(`Target: ${input.target}`);
  if (input.slot) lines.push(`Preferred slot: ${input.slot}`);
  if (input.message) lines.push(`Message: ${input.message}`);
  lines.push(`Reference: ${input.reference}`);
  return lines;
}

/** Confirmation to the person who submitted the request. */
export function renderMeetingRequestConfirmation(input: MeetingRequestEmailInput) {
  const subject = `Request received: ${MEETING_TYPE_LABEL[input.type]} at ${input.eventTitle}`;
  const text = [
    `Hello ${input.requesterName},`,
    "",
    `Your ${MEETING_TYPE_LABEL[input.type].toLowerCase()} request for ${input.eventTitle} is recorded.`,
    "",
    ...meetingLines(input),
    "",
    "The organizer has your details and will respond directly.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(input.requesterName)},`),
      paragraph(
        `Your ${escapeHtml(MEETING_TYPE_LABEL[input.type].toLowerCase())} request for <strong>${escapeHtml(input.eventTitle)}</strong> is recorded.`
      ),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">${meetingLines(input)
        .map((line) => {
          const [label, ...rest] = line.split(": ");
          return row(label, rest.join(": "));
        })
        .join("")}</table>`,
      paragraph("The organizer has your details and will respond directly."),
    ].join("")
  );
  return { subject, text, html };
}

/** Notification to the organizer, with a reply-to path via the requester. */
export function renderMeetingRequestNotification(
  input: MeetingRequestEmailInput & { requesterEmail: string }
) {
  const subject = `New ${MEETING_TYPE_LABEL[input.type].toLowerCase()}: ${input.eventTitle}`;
  const text = [
    `A new ${MEETING_TYPE_LABEL[input.type].toLowerCase()} request needs your response.`,
    "",
    ...meetingLines(input),
    `Reply to: ${input.requesterEmail}`,
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(
        `A new ${escapeHtml(MEETING_TYPE_LABEL[input.type].toLowerCase())} request needs your response.`
      ),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">${meetingLines(input)
        .map((line) => {
          const [label, ...rest] = line.split(": ");
          return row(label, rest.join(": "));
        })
        .join("")}${row("Reply to", input.requesterEmail)}</table>`,
    ].join("")
  );
  return { subject, text, html };
}

export type MeetingDecision = "CONFIRMED" | "DECLINED";

/** Tells the requester what the organizer decided. */
export function renderMeetingRequestDecision(
  input: MeetingRequestEmailInput & { status: MeetingDecision }
) {
  const verb = input.status === "CONFIRMED" ? "confirmed" : "declined";
  const subject = `Request ${verb}: ${MEETING_TYPE_LABEL[input.type]} at ${input.eventTitle}`;
  const text = [
    `Hello ${input.requesterName},`,
    "",
    `The organizer has ${verb} your ${MEETING_TYPE_LABEL[input.type].toLowerCase()} request for ${input.eventTitle}.`,
    "",
    ...meetingLines(input),
    "",
    input.status === "CONFIRMED"
      ? "The organizer will contact you with the confirmed time and location."
      : "You can submit a new request from the event page if your plans change.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(input.requesterName)},`),
      paragraph(
        `The organizer has <strong>${verb}</strong> your ${escapeHtml(
          MEETING_TYPE_LABEL[input.type].toLowerCase()
        )} request for <strong>${escapeHtml(input.eventTitle)}</strong>.`
      ),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">${meetingLines(input)
        .map((line) => {
          const [label, ...rest] = line.split(": ");
          return row(label, rest.join(": "));
        })
        .join("")}</table>`,
      paragraph(
        input.status === "CONFIRMED"
          ? "The organizer will contact you with the confirmed time and location."
          : "You can submit a new request from the event page if your plans change."
      ),
    ].join("")
  );
  return { subject, text, html };
}

export interface BookingCancellationInput {
  attendeeName: string;
  eventTitle: string;
  bookingId: string;
}

/** Confirms a cancellation and states that the seat is released. */
export function renderBookingCancellation({
  attendeeName,
  eventTitle,
  bookingId,
}: BookingCancellationInput) {
  const subject = `Pass cancelled: ${eventTitle}`;
  const text = [
    `Hello ${attendeeName},`,
    "",
    `Your pass for ${eventTitle} has been cancelled and the seat is released.`,
    "",
    `Reference: ${bookingId}`,
    "",
    "If this was not you, contact the organizer immediately.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(attendeeName)},`),
      paragraph(
        `Your pass for <strong>${escapeHtml(eventTitle)}</strong> has been cancelled and the seat is released.`
      ),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">${row(
        "Reference",
        bookingId,
        true
      )}</table>`,
      paragraph("If this was not you, contact the organizer immediately."),
    ].join("")
  );
  return { subject, text, html };
}

export interface BookingTransferInput extends BookingCancellationInput {
  passUrl: string;
}

/** Tells the new holder that the pass now belongs to them. */
export function renderBookingTransfer({
  attendeeName,
  eventTitle,
  bookingId,
  passUrl,
}: BookingTransferInput) {
  const subject = `Pass transferred to you: ${eventTitle}`;
  const text = [
    `Hello ${attendeeName},`,
    "",
    `A pass for ${eventTitle} has been transferred to you.`,
    "",
    `Reference: ${bookingId}`,
    "",
    `Open your pass: ${passUrl}`,
    "",
    "Show the QR code at the gate. The original pass QR remains valid.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(attendeeName)},`),
      paragraph(
        `A pass for <strong>${escapeHtml(eventTitle)}</strong> has been transferred to you.`
      ),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">${row(
        "Reference",
        bookingId,
        true
      )}</table>`,
      `<p style="margin:0 0 16px;"><a href="${escapeHtml(passUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">Open your pass</a></p>`,
      paragraph("Show the QR code at the gate. The original pass QR remains valid."),
    ].join("")
  );
  return { subject, text, html };
}

export interface WaitlistPromotionInput {
  name: string;
  eventTitle: string;
  tierName: string;
  eventUrl: string;
}

/** Tells the head of the queue that a seat opened. */
export function renderWaitlistPromotion({
  name,
  eventTitle,
  tierName,
  eventUrl,
}: WaitlistPromotionInput) {
  const subject = `A seat opened: ${eventTitle}`;
  const text = [
    `Hello ${name},`,
    "",
    `A seat opened in ${tierName} for ${eventTitle}.`,
    "",
    `Reserve it here: ${eventUrl}`,
    "",
    "Seats are released first come, first served. If you no longer need it, you can leave the waitlist from the event page.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(name)},`),
      paragraph(
        `A seat opened in <strong>${escapeHtml(tierName)}</strong> for <strong>${escapeHtml(eventTitle)}</strong>.`
      ),
      `<p style="margin:0 0 16px;"><a href="${escapeHtml(eventUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">Reserve the seat</a></p>`,
      paragraph("Seats are released first come, first served. If you no longer need it, you can leave the waitlist from the event page."),
    ].join("")
  );
  return { subject, text, html };
}

export interface EventReminderInput {
  attendeeName: string;
  eventTitle: string;
  datesText: string;
  venueText: string;
  hoursUntil: number;
  passUrl: string;
}

/** Reminds a confirmed delegate that the event is close. */
export function renderEventReminder({
  attendeeName,
  eventTitle,
  datesText,
  venueText,
  hoursUntil,
  passUrl,
}: EventReminderInput) {
  const when = hoursUntil <= 2 ? "in 2 hours" : "tomorrow";
  const subject = `Reminder: ${eventTitle} starts ${when}`;
  const text = [
    `Hello ${attendeeName},`,
    "",
    `${eventTitle} starts ${when}.`,
    "",
    `Date: ${datesText}`,
    `Venue: ${venueText}`,
    "",
    `Open your pass: ${passUrl}`,
    "",
    "Show the QR code at the gate. It works offline once the pass page has loaded.",
    "",
    "XPO MICE",
  ].join("\n");
  const html = shell(
    [
      paragraph(`Hello ${escapeHtml(attendeeName)},`),
      paragraph(
        `<strong>${escapeHtml(eventTitle)}</strong> starts ${escapeHtml(when)}.`
      ),
      `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14px;color:#0f172a;">${row(
        "Date",
        datesText
      )}${row("Venue", venueText)}</table>`,
      `<p style="margin:0 0 16px;"><a href="${escapeHtml(passUrl)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">Open your pass</a></p>`,
      paragraph("Show the QR code at the gate. It works offline once the pass page has loaded."),
    ].join("")
  );
  return { subject, text, html };
}
