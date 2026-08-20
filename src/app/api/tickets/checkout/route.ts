import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTicketHash, generateSvgQrCode, type TicketPassPayload } from "@/lib/tickets/qrPass";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, tierId, attendeeName, attendeeEmail, quantity = 1, userId } = body;

    // 1. Validation
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "VALIDATION_ERROR: Missing or invalid eventId" },
        { status: 400 }
      );
    }
    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json(
        { error: "VALIDATION_ERROR: Missing or invalid tierId" },
        { status: 400 }
      );
    }
    if (!attendeeName || typeof attendeeName !== "string" || attendeeName.trim().length === 0) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR: Missing or invalid attendeeName" },
        { status: 400 }
      );
    }
    if (
      !attendeeEmail ||
      typeof attendeeEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail.trim())
    ) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR: Missing or invalid attendeeEmail address" },
        { status: 400 }
      );
    }

    const qty = Math.max(1, parseInt(String(quantity), 10) || 1);

    // 2. Fetch Tier & Event
    const tier = await db.ticketTier.findUnique({
      where: { id: tierId },
      include: {
        event: {
          include: {
            venue: true,
            venueHall: true,
            perks: true,
          },
        },
      },
    });

    if (!tier || tier.eventId !== eventId) {
      return NextResponse.json(
        { error: "NOT_FOUND: Ticket tier not found for this event" },
        { status: 404 }
      );
    }

    // 3. Capacity Check
    if (tier.soldCount + qty > tier.capacity) {
      return NextResponse.json(
        {
          error: "CAPACITY_EXCEEDED: Ticket tier is sold out or requested quantity exceeds remaining capacity",
          remaining: Math.max(0, tier.capacity - tier.soldCount),
        },
        { status: 400 }
      );
    }

    // 4. Resolve or create Attendee User
    const normalizedEmail = attendeeEmail.toLowerCase().trim();
    let user = null;

    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await db.user.findUnique({ where: { email: normalizedEmail } });
    }
    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          name: attendeeName.trim(),
          role: "ATTENDEE",
        },
      });
    }

    // 5. Generate Cryptographic Pass
    const bookingId = `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const payload: TicketPassPayload = {
      bookingId,
      eventId: tier.eventId,
      tierId: tier.id,
      attendeeEmail: normalizedEmail,
      issuedAt: Date.now(),
      nonce: `nonce-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };

    const { qrCodeHash, signature, payloadString } = generateTicketHash(payload);
    const svgQr = generateSvgQrCode(qrCodeHash, { primaryColor: "#1e3a8a", size: 300 });

    // 6. Persist Booking & Increment soldCount
    const booking = await db.booking.create({
      data: {
        id: bookingId,
        userId: user.id,
        eventId: tier.eventId,
        ticketTierId: tier.id,
        attendeeName: attendeeName.trim(),
        attendeeEmail: normalizedEmail,
        status: "CONFIRMED",
        qrCodeHash,
      },
      include: {
        event: {
          include: {
            venue: true,
            venueHall: true,
            perks: true,
          },
        },
        ticketTier: true,
      },
    });

    await db.ticketTier.update({
      where: { id: tier.id },
      data: { soldCount: { increment: qty } },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ticket pass reservation confirmed successfully",
        booking: {
          id: booking.id,
          status: booking.status,
          qrCodeHash: booking.qrCodeHash,
          signature,
          payloadString,
          svgQr,
          attendeeName: booking.attendeeName,
          attendeeEmail: booking.attendeeEmail,
          createdAt: booking.createdAt,
          ticketTier: {
            id: booking.ticketTier.id,
            name: booking.ticketTier.name,
            price: booking.ticketTier.price,
            currency: booking.ticketTier.currency,
          },
          event: {
            id: booking.event.id,
            title: booking.event.title,
            slug: booking.event.slug,
            startDate: booking.event.startDate,
            endDate: booking.event.endDate,
            venue: {
              name: booking.event.venue?.name,
              city: booking.event.venue?.city,
              hallName: booking.event.venueHall?.name,
            },
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `INTERNAL_ERROR: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
