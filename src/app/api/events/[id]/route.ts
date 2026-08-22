import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    let event = await db.event.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            halls: true,
          },
        },
        venueHall: true,
        ticketTiers: true,
        booths: true,
        agendaItems: {
          orderBy: { startTime: "asc" },
        },
        perks: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            organization: true,
            jobTitle: true,
          },
        },
        aiReports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!event) {
      event = await db.event.findUnique({
        where: { slug: id },
        include: {
          venue: {
            include: {
              halls: true,
            },
          },
          venueHall: true,
          ticketTiers: true,
          booths: true,
          agendaItems: {
            orderBy: { startTime: "asc" },
          },
          perks: true,
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              organization: true,
              jobTitle: true,
            },
          },
          aiReports: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event not found for identifier: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to retrieve event: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
