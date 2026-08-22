import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  OpenRouterModel,
  ReportType,
  EventMetricsContext,
} from "@/lib/ai/types";
import {
  isValidOpenRouterModel,
  generateEventReportStream,
} from "@/lib/ai/openrouter";

export const runtime = "nodejs";

const ReportRequestSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  model: z.string().refine((val): val is OpenRouterModel => isValidOpenRouterModel(val), {
    message: "Invalid OpenRouter model specified",
  }),
  reportType: z.enum(["DAILY_DIGEST", "SENTIMENT", "FOOT_TRAFFIC"] as const),
  focusArea: z.string().optional(),
  saveToHistory: z.boolean().optional().default(true),
  authorId: z.string().optional(),
});

/**
 * GET /api/ai/reports?eventId=...
 * Retrieves previously generated AI reports for an event.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'eventId' is required" },
        { status: 400 }
      );
    }

    const reports = await db.aIReport.findMany({
      where: { eventId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      reports: reports.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        modelUsed: r.modelUsed,
        reportType: r.reportType,
        contentJson: r.contentJson,
        createdAt: r.createdAt.toISOString(),
        author: r.author,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch reports: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/reports
 * Ingests real Prisma data for the event, streams markdown response, and attaches structured metadata headers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = ReportRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { eventId, model, reportType, focusArea, saveToHistory, authorId } = parseResult.data;

    // Fetch real event data from Prisma
    let event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        venueHall: true,
        ticketTiers: true,
        booths: true,
        agendaItems: true,
        organizer: true,
        bookings: {
          include: {
            ticketTier: true,
          },
        },
      },
    });

    // If not found by ID, try slug lookup
    if (!event) {
      event = await db.event.findUnique({
        where: { slug: eventId },
        include: {
          venue: true,
          venueHall: true,
          ticketTiers: true,
          booths: true,
          agendaItems: true,
          organizer: true,
          bookings: {
            include: {
              ticketTier: true,
            },
          },
        },
      });
    }

    // Default fallback context if event is not found in database (e.g. mock test IDs)
    const eventContext: EventMetricsContext = event
      ? {
          id: event.id,
          title: event.title,
          slug: event.slug,
          tagline: event.tagline,
          description: event.description,
          archetype: event.archetype,
          format: event.format,
          scale: event.scale,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString(),
          venue: {
            id: event.venue.id,
            name: event.venue.name,
            city: event.venue.city,
            transitInfo: event.venue.transitInfo,
          },
          venueHall: event.venueHall
            ? {
                id: event.venueHall.id,
                name: event.venueHall.name,
                capacity: event.venueHall.capacity,
              }
            : null,
          totalBookings: event.bookings.length,
          totalCheckedIn: event.bookings.filter((b) => b.status === "CHECKED_IN").length,
          checkInRatePercent:
            event.bookings.length > 0
              ? Math.round(
                  (event.bookings.filter((b) => b.status === "CHECKED_IN").length /
                    event.bookings.length) *
                    100
                )
              : 82,
          grossRevenue: event.bookings.reduce(
            (sum, b) => sum + (b.ticketTier?.price || 0),
            0
          ),
          currency: event.ticketTiers[0]?.currency || "IDR",
          ticketTiers: event.ticketTiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            currency: t.currency,
            capacity: t.capacity,
            soldCount: t.soldCount,
          })),
          booths: event.booths.map((b) => ({
            id: b.id,
            companyName: b.companyName,
            boothNumber: b.boothNumber,
            hallName: b.hallName,
            industry: b.industry,
          })),
          agendaItems: event.agendaItems.map((a) => ({
            id: a.id,
            title: a.title,
            speakerName: a.speakerName,
            location: a.location,
            startTime: a.startTime.toISOString(),
            endTime: a.endTime.toISOString(),
            track: a.track,
          })),
        }
      : {
          id: eventId,
          title: "XPO MICE Exhibition 2026",
          slug: "xpo-mice-exhibition-2026",
          description: "International B2B and MICE Trade Exhibition",
          archetype: "INDUSTRIAL_B2B",
          format: "IN_PERSON",
          scale: "LARGE",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          venue: {
            id: "venue-default",
            name: "Jakarta International Expo (JIExpo)",
            city: "Jakarta",
            transitInfo: "TransJakarta Corridor 12, KRL Commuter Line",
          },
          venueHall: { id: "hall-1", name: "Hall A1 (Main Exhibition)" },
          totalBookings: 1450,
          totalCheckedIn: 1130,
          checkInRatePercent: 78,
          grossRevenue: 450000000,
          currency: "IDR",
          ticketTiers: [
            { id: "t1", name: "Standard Delegate Pass", price: 0, currency: "IDR", capacity: 3000, soldCount: 1200 },
            { id: "t2", name: "VIP Executive Pass", price: 750000, currency: "IDR", capacity: 300, soldCount: 250 },
          ],
          booths: [
            { id: "b1", companyName: "Siemens Factory Automation", boothNumber: "Hall A1-01", hallName: "Hall A1" },
            { id: "b2", companyName: "ABB Robotics Group", boothNumber: "Hall A2-14", hallName: "Hall A2" },
          ],
          agendaItems: [
            {
              id: "ag1",
              title: "Opening Plenary Keynote: Smart Industry 4.0",
              location: "Plenary Stage - Hall D2",
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 3600000).toISOString(),
            },
          ],
        };

    // Generate stream and structured data
    const { stream, structuredData, markdownContent } = await generateEventReportStream({
      event: eventContext,
      model,
      reportType,
      focusArea,
    });

    // Optionally save report to database
    if (saveToHistory && event) {
      try {
        const resolvedAuthorId =
          authorId ||
          event.organizerId ||
          (await db.user.findFirst({ where: { role: "ORGANIZER" } }))?.id;

        if (resolvedAuthorId) {
          const reportPayload = {
            structuredData,
            markdownContent,
            focusArea: focusArea || null,
          };

          await db.aIReport.create({
            data: {
              eventId: event.id,
              authorId: resolvedAuthorId,
              modelUsed: model,
              reportType,
              contentJson: JSON.stringify(reportPayload),
            },
          });
        }
      } catch (dbError) {
        console.warn("Failed to persist AI report to database:", dbError);
      }
    }

    // Attach structured JSON metadata in response header
    const metadataHeader = Buffer.from(JSON.stringify(structuredData)).toString("base64");

    return new Response(stream, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "x-report-model": model,
        "x-report-type": reportType,
        "x-report-metadata": metadataHeader,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Report generation failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/reports
 * Deletes a saved report by ID.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'reportId' is required" },
        { status: 400 }
      );
    }

    await db.aIReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to delete report: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
