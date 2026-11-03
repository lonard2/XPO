import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { POST } from "@/app/api/meetings/request/route";
import { setEmailTransport, type EmailMessage } from "@/lib/email/transport";

describe("meeting request API", () => {
  let eventId = "";
  let eventTitle = "";

  beforeAll(async () => {
    await db.$connect();
    const event = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
    });
    expect(event).toBeDefined();
    eventId = event!.id;
    eventTitle = event!.title;
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    await db.meetingRequest.deleteMany({
      where: { requesterEmail: { contains: "meeting-test" } },
    });
    await db.$disconnect();
  });

  const post = (body: unknown) =>
    POST(
      new Request("http://localhost/api/meetings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );

  it("persists an RFQ and emails both sides", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const response = await post({
      eventId,
      type: "RFQ",
      requesterName: "PT Industri Prima",
      requesterEmail: "meeting-test-rfq@example.com",
      target: "Apex Robotics",
      slot: "5 units",
      message: "Need 5 units by Q2",
    });

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.requestId).toBeDefined();

    const row = await db.meetingRequest.findUnique({ where: { id: json.requestId } });
    expect(row?.status).toBe("PENDING");
    expect(row?.target).toBe("Apex Robotics");

    const recipients = sent.map((message) => message.to);
    expect(recipients).toContain("meeting-test-rfq@example.com");
    // The seeded event has a registered organizer.
    expect(sent.length).toBe(2);
    expect(sent[0].subject).toContain(eventTitle);
  });

  it("rejects unknown types, bad emails and missing events", async () => {
    const base = {
      eventId,
      type: "RFQ",
      requesterName: "PT Industri Prima",
      requesterEmail: "meeting-test-bad@example.com",
    };

    expect((await post({ ...base, type: "NOPE" })).status).toBe(400);
    expect((await post({ ...base, requesterEmail: "not-an-email" })).status).toBe(400);
    expect((await post({ ...base, requesterName: "" })).status).toBe(400);
    expect((await post({ ...base, eventId: "evt_does_not_exist" })).status).toBe(404);

    expect(
      await db.meetingRequest.count({ where: { requesterEmail: "meeting-test-bad@example.com" } })
    ).toBe(0);
  });
});
