import { describe, it, expect } from "vitest";
import {
  renderOtpEmail,
  renderBookingConfirmation,
  renderMeetingRequestConfirmation,
  renderMeetingRequestNotification,
  renderMeetingRequestDecision,
  renderBookingCancellation,
  renderBookingTransfer,
  renderWaitlistPromotion,
  renderEventReminder,
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

describe("meeting decision emails", () => {
  const base = {
    type: "RFQ" as const,
    eventTitle: "Manufacturing Indonesia 2026",
    requesterName: "PT Industri Prima",
    target: "Apex Robotics",
    slot: "5 units",
    message: "Need 5 units by Q2",
    reference: "cmr456",
  };

  it("tells the requester the request was confirmed", () => {
    const mail = renderMeetingRequestDecision({ ...base, status: "CONFIRMED" });
    expect(mail.subject).toContain("confirmed");
    expect(mail.text).toContain("confirmed");
    expect(mail.text).toContain("cmr456");
    expect(mail.text).toContain("Apex Robotics");
  });

  it("tells the requester the request was declined", () => {
    const mail = renderMeetingRequestDecision({ ...base, status: "DECLINED" });
    expect(mail.subject).toContain("declined");
    expect(mail.text).toContain("submit a new request");
  });

  it("escapes user-supplied text", () => {
    const mail = renderMeetingRequestDecision({
      ...base,
      status: "CONFIRMED",
      requesterName: '<img src=x onerror="alert(1)">',
    });
    expect(mail.html).not.toContain("<img src=x");
    expect(mail.html).toContain("&lt;img src=x");
  });
});


describe("booking lifecycle emails", () => {
  it("confirms a cancellation and names the released seat", () => {
    const mail = renderBookingCancellation({
      attendeeName: "Alex Pratama",
      eventTitle: "Manufacturing Indonesia 2026",
      bookingId: "bkg-1",
    });
    expect(mail.subject).toContain("cancelled");
    expect(mail.text).toContain("seat is released");
    expect(mail.text).toContain("bkg-1");
  });

  it("tells the new holder the pass is theirs and the QR still works", () => {
    const mail = renderBookingTransfer({
      attendeeName: "New Holder",
      eventTitle: "Manufacturing Indonesia 2026",
      bookingId: "bkg-1",
      passUrl: "https://xpo.events/en/my-tickets/bkg-1",
    });
    expect(mail.subject).toContain("transferred");
    expect(mail.text).toContain("https://xpo.events/en/my-tickets/bkg-1");
    expect(mail.text).toContain("remains valid");
  });

  it("escapes the holder name in both messages", () => {
    const name = '<img src=x onerror="alert(1)">';
    const cancelled = renderBookingCancellation({
      attendeeName: name,
      eventTitle: "Event",
      bookingId: "bkg-1",
    });
    const transferred = renderBookingTransfer({
      attendeeName: name,
      eventTitle: "Event",
      bookingId: "bkg-1",
      passUrl: "https://xpo.events/en/my-tickets/bkg-1",
    });
    expect(cancelled.html).not.toContain("<img src=x");
    expect(transferred.html).not.toContain("<img src=x");
  });
});


describe("waitlist promotion email", () => {
  it("names the tier and links to the event", () => {
    const mail = renderWaitlistPromotion({
      name: "Queue One",
      eventTitle: "Manufacturing Indonesia 2026",
      tierName: "VIP Delegate",
      eventUrl: "https://xpo.events/en/events/manufacturing-indonesia-2026",
    });
    expect(mail.subject).toContain("A seat opened");
    expect(mail.text).toContain("VIP Delegate");
    expect(mail.text).toContain("https://xpo.events/en/events/manufacturing-indonesia-2026");
  });

  it("escapes the holder name", () => {
    const mail = renderWaitlistPromotion({
      name: '<img src=x onerror="alert(1)">',
      eventTitle: "Event",
      tierName: "Pass",
      eventUrl: "https://xpo.events/en/events/event",
    });
    expect(mail.html).not.toContain("<img src=x");
  });
});


describe("event reminder email", () => {
  it("states the window and links the pass", () => {
    const mail = renderEventReminder({
      attendeeName: "Alex Pratama",
      eventTitle: "Manufacturing Indonesia 2026",
      datesText: "14 - 17 September 2026",
      venueText: "JIExpo Kemayoran, Hall A1",
      hoursUntil: 24,
      passUrl: "https://xpo.events/en/my-tickets/bkg-1",
    });
    expect(mail.subject).toContain("tomorrow");
    expect(mail.text).toContain("https://xpo.events/en/my-tickets/bkg-1");
  });

  it("uses the short window for a two-hour reminder", () => {
    const mail = renderEventReminder({
      attendeeName: "Alex Pratama",
      eventTitle: "Event",
      datesText: "Today",
      venueText: "Hall A1",
      hoursUntil: 2,
      passUrl: "https://xpo.events/en/my-tickets/bkg-1",
    });
    expect(mail.subject).toContain("in 2 hours");
  });
});
