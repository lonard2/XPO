import { describe, it, expect } from "vitest";
import {
  renderOtpEmail,
  renderBookingConfirmation,
  renderMeetingRequestConfirmation,
  renderMeetingRequestNotification,
} from "@/lib/email/templates";

describe("OTP email", () => {
  it("puts the code in the subject and body", () => {
    const mail = renderOtpEmail({ code: "123456", purpose: "LOGIN" });
    expect(mail.subject).toContain("123456");
    expect(mail.text).toContain("123456");
    expect(mail.html).toContain("123456");
    expect(mail.text).toMatch(/expires in 10 minutes/i);
  });

  it("changes the action for email verification", () => {
    const login = renderOtpEmail({ code: "111111", purpose: "LOGIN" });
    const verify = renderOtpEmail({ code: "111111", purpose: "VERIFY_EMAIL" });
    expect(login.text).toContain("sign in");
    expect(verify.text).toContain("verify your email address");
  });
});

describe("booking confirmation", () => {
  const base = {
    attendeeName: "Alex Pratama",
    eventTitle: "Jakarta Fashion & Beauty Trade Expo 2026",
    datesText: "Nov 5 – 9, 2026",
    venueText: "JICC, Balai Sidang",
    tierName: "Trade Visitor Pass",
    bookingId: "bk-abc123",
    passUrl: "https://xpo.events/en/my-tickets/bk-abc123",
  };

  it("states the event, date, venue, tier and reference", () => {
    const mail = renderBookingConfirmation(base);
    expect(mail.subject).toContain(base.eventTitle);
    for (const value of [base.attendeeName, base.datesText, base.venueText, base.tierName, base.bookingId]) {
      expect(mail.text).toContain(value);
    }
    expect(mail.html).toContain(base.passUrl);
  });

  it("escapes user-supplied text so it cannot inject markup", () => {
    const mail = renderBookingConfirmation({
      ...base,
      attendeeName: '<img src=x onerror="alert(1)">',
      eventTitle: "Expo <script>alert(1)</script>",
    });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<img src=x");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("&lt;img src=x");
  });
});

describe("meeting request emails", () => {
  const base = {
    type: "RFQ" as const,
    eventTitle: "Manufacturing Indonesia 2026",
    requesterName: "PT Industri Prima",
    target: "Apex Robotics",
    slot: "5 units",
    message: "Need 5 units by Q2",
    reference: "cmr123",
  };

  it("confirms receipt to the requester with the reference", () => {
    const mail = renderMeetingRequestConfirmation(base);
    expect(mail.subject).toContain("Request for Quotation");
    expect(mail.text).toContain("cmr123");
    expect(mail.text).toContain("Apex Robotics");
    expect(mail.html).toContain("cmr123");
  });

  it("tells the organizer who to reply to", () => {
    const mail = renderMeetingRequestNotification({ ...base, requesterEmail: "buyer@co.com" });
    expect(mail.text).toContain("Reply to: buyer@co.com");
    expect(mail.subject).toContain("request for quotation");
  });

  it("escapes user-supplied text", () => {
    const mail = renderMeetingRequestConfirmation({
      ...base,
      requesterName: '<img src=x onerror="alert(1)">',
      message: "Hello <script>alert(1)</script>",
    });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<img src=x");
    expect(mail.html).toContain("&lt;script&gt;");
  });
});
