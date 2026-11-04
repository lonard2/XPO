import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError } from "@/lib/api/envelope";

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
      return apiError(`Event not found for identifier: ${id}`, 404);
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    return apiError(`Failed to retrieve event: ${(error as Error).message}`, 500);
  }
}
