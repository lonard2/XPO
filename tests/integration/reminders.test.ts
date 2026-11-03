import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { db } from "@/lib/db";
import { GET as runReminders } from "@/app/api/cron/reminders/route";
import { setEmailTransport, type EmailMessage } from "@/lib/email/transport";

const SECRET = "test-cron-secret";

describe("reminder scheduler", () => {
  const stamp = Date.now();
  let user: any;
  let venueId = "";
  let event24: any;
  let event2: any;
  let eventFar: any;
  let tier24: any;
  let tier2: any;
  let tierFar: any;
  let booking24: any;
  let booking2: any;
  let bookingFar: any;

  const call = (authorized = true) =>
    runReminders(
      new Request("http://localhost/api/cron/reminders", {
        headers: authorized ? { Authorization: `Bearer ${SECRET}` } : {},
      })
    );

  async function makeEvent(slug: string, startOffsetMs: number) {
    const event = await db.event.create({
      data: {
        regionId: "id",
        venueId,
        title: `Reminder ${slug} ${stamp}`,
        slug: `${slug}-${stamp}`,
        description: "Reminder coverage.",
        startDate: new Date(Date.now() + startOffsetMs),
        endDate: new Date(Date.now() + startOffsetMs + 8 * 3600_000),
      },
    });
    const tier = await db.ticketTier.create({
      data: { eventId: event.id, name: "Pass", price: 0, currency: "IDR", capacity: 10, soldCount: 1 },
    });
    const booking = await db.booking.create({
      data: {
        userId: user.id,
        eventId: event.id,
        ticketTierId: tier.id,
        attendeeName: "Reminder Holder",
        attendeeEmail: `${slug}-${stamp}@example.com`,
        status: "CONFIRMED",
        qrCodeHash: `XPO-PASS-${slug}-${stamp}`,
      },
    });
    return { event, tier, booking };
  }

  beforeAll(async () => {
    process.env.CRON_SECRET = SECRET;
    await db.$connect();
    const venue = await db.venue.findFirst();
    expect(venue).toBeDefined();
    venueId = venue!.id;
    user = await db.user.create({
      data: { email: `reminder-user-${stamp}@example.com`, name: "Reminder User", role: "ATTENDEE" },
    });

    ({ event: event24, tier: tier24, booking: booking24 } = await makeEvent("rem-24h", 23 * 3600_000));
    ({ event: event2, tier: tier2, booking: booking2 } = await makeEvent("rem-2h", 1 * 3600_000));
    ({ event: eventFar, tier: tierFar, booking: bookingFar } = await makeEvent("rem-far", 72 * 3600_000));
  });

  afterEach(() => {
    setEmailTransport(null);
  });

  afterAll(async () => {
    const ids = [event24?.id, event2?.id, eventFar?.id].filter(Boolean);
    await db.booking.deleteMany({ where: { eventId: { in: ids } } });
    await db.ticketTier.deleteMany({ where: { eventId: { in: ids } } });
    await db.event.deleteMany({ where: { id: { in: ids } } });
    await db.user.deleteMany({ where: { id: user?.id } });
    delete process.env.CRON_SECRET;
    await db.$disconnect();
  });

  it("rejects a call without the secret", async () => {
    const res = await call(false);
    expect(res.status).toBe(401);
  });

  it("sends the long and short reminders exactly once", async () => {
    const sent: EmailMessage[] = [];
    setEmailTransport({
      name: "test",
      delivers: true,
      send: async (message) => {
        sent.push(message);
      },
    });

    const res = await call();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sent).toBe(2);

    const recipients = sent.map((message) => message.to);
    expect(recipients).toContain(`rem-24h-${stamp}@example.com`);
    expect(recipients).toContain(`rem-2h-${stamp}@example.com`);
    expect(recipients).not.toContain(`rem-far-${stamp}@example.com`);

    const long = await db.booking.findUnique({ where: { id: booking24.id } });
    expect(long?.reminder24hSentAt).toBeTruthy();
    const short = await db.booking.findUnique({ where: { id: booking2.id } });
    expect(short?.reminder2hSentAt).toBeTruthy();

    const again = await call();
    expect((await again.json()).sent).toBe(0);
  });

  it("leaves a far-future booking untouched", async () => {
    const far = await db.booking.findUnique({ where: { id: bookingFar.id } });
    expect(far?.reminder24hSentAt).toBeNull();
    expect(far?.reminder2hSentAt).toBeNull();
  });
});
