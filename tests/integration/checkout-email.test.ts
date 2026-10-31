import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { POST } from "@/app/api/tickets/checkout/route";
import { setEmailTransport } from "@/lib/email/transport";
import type { EmailMessage } from "@/lib/email/transport";

describe("checkout confirmation email", () => {
  let eventId = "";
  let tierId = "";
  let eventTitle = "";

  beforeAll(async () => {
    await db.$connect();
    const event = await db.event.findFirst({
      where: { slug: "jakarta-fashion-beauty-2026" },
      include: { ticketTiers: true },
    });
    expect(event).toBeDefined();
    eventId = event!.id;
    eventTitle = event!.title;
    tierId = event!.ticketTiers[0].id;
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.booking.deleteMany({
      where: { attendeeEmail: { contains: "checkout-email" } },
    });
    await db.$disconnect();
  });

  it("emails the delegate after the pass is reserved", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const response = await POST(
      new Request("http://localhost/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          tierId,
          attendeeName: "Email Check",
          attendeeEmail: "checkout-email@example.com",
          quantity: 1,
          locale: "en",
        }),
      })
    );

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("checkout-email@example.com");
    expect(sent[0].subject).toContain(eventTitle);
    expect(sent[0].text).toContain(`Reference: ${json.booking.id}`);
    expect(sent[0].text).toContain(`/en/my-tickets/${json.booking.id}`);
  });

  it("still returns the pass when email delivery fails", async () => {
    setEmailTransport({
      name: "failing",
      delivers: true,
      send: async () => {
        throw new Error("mail server down");
      },
    });

    const response = await POST(
      new Request("http://localhost/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          tierId,
          attendeeName: "Email Down",
          attendeeEmail: "checkout-email-down@example.com",
          quantity: 1,
          locale: "en",
        }),
      })
    );

    // A committed booking must not be lost because mail is unavailable.
    expect(response.status).toBe(201);
  });
});
