import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  generateStructuredReport,
  streamOpenRouterChat,
  type OpenRouterModel,
} from "../helpers/contracts";

describe("Phase 10 Integration: AI Concierge & Multi-Model Reporting System", () => {
  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    // Clean up test reports
    await db.aIReport.deleteMany({
      where: { contentJson: { contains: "Integration Test" } },
    });
    await db.$disconnect();
  });

  it("T4.2 (Concierge Grounding): grounds attendee concierge with venue transit, halls, and schedule", async () => {
    const event = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
      include: { venue: { include: { halls: true } }, agendaItems: true, booths: true },
    });

    expect(event).toBeDefined();
    expect(event?.venue.transitInfo).toContain("TransJakarta");
    expect(event?.venue.halls.length).toBeGreaterThanOrEqual(3);

    // Stream concierge chat response grounded in DB context
    const stream = await streamOpenRouterChat({
      model: "google/gemini-3.5-flash-lite",
      messages: [
        {
          role: "system",
          content: `You are the concierge for ${event?.title} at ${event?.venue.name}. Transit: ${event?.venue.transitInfo}`,
        },
        { role: "user", content: "How do I reach the venue by public transit?" },
      ],
    });

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      responseText += decoder.decode(value, { stream: true });
    }

    expect(responseText).toContain("Welcome to XPO MICE Concierge");
  });

  it("T4.3 (Organizer AI Report Persistence): generates multi-model report and saves to database", async () => {
    const event = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
      include: { organizer: true },
    });
    expect(event).toBeDefined();

    const ReportSchema = z.object({
      summary: z.string(),
      sentimentScore: z.number(),
      footTrafficIndex: z.number(),
      topSessions: z.array(z.object({ title: z.string(), attendance: z.number() })),
      recommendedActions: z.array(z.string()),
      modelUsed: z.string(),
      generatedAt: z.string(),
    });

    const reportModel: OpenRouterModel = "google/gemini-3.7-flash";
    const reportData = await generateStructuredReport({
      model: reportModel,
      prompt: `Integration Test Daily Digest for ${event?.title}`,
      schema: ReportSchema,
    });

    expect(reportData.modelUsed).toBe(reportModel);

    // Save report in database
    const savedReport = await db.aIReport.create({
      data: {
        eventId: event!.id,
        authorId: event!.organizerId,
        modelUsed: reportModel,
        reportType: "DAILY_DIGEST",
        contentJson: JSON.stringify(reportData),
      },
      include: { event: true, author: true },
    });

    expect(savedReport.id).toBeDefined();
    expect(savedReport.modelUsed).toBe(reportModel);
    expect(savedReport.author.email).toBe("organizer@xpo.com");

    const parsedContent = JSON.parse(savedReport.contentJson);
    expect(parsedContent.sentimentScore).toBe(0.92);
    expect(parsedContent.recommendedActions.length).toBeGreaterThanOrEqual(2);
  });
});
