import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET, DELETE } from "@/app/api/ai/reports/route";
import { db } from "@/lib/db";

describe("Phase 10 Integration: AI Reports API Route (POST / GET / DELETE /api/ai/reports)", () => {
  let testEvent: any;
  let createdReportId: string | null = null;

  beforeAll(async () => {
    await db.$connect();
    testEvent = await db.event.findFirst({
      where: { slug: "manufacturing-indonesia-2026" },
      include: { organizer: true, ticketTiers: true, booths: true },
    });
  });

  afterAll(async () => {
    // Clean up any test generated reports
    if (testEvent) {
      await db.aIReport.deleteMany({
        where: {
          eventId: testEvent.id,
          contentJson: { contains: "Integration Test" },
        },
      });
    }
    await db.$disconnect();
  });

  it("POST /api/ai/reports generates streaming Daily Executive Digest with metadata headers", async () => {
    expect(testEvent).toBeDefined();

    const req = new NextRequest("http://localhost:3000/api/ai/reports", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        model: "google/gemini-3.7-flash",
        reportType: "DAILY_DIGEST",
        focusArea: "Integration Test Morning Gate Throughput",
        saveToHistory: true,
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/markdown");
    expect(response.headers.get("x-report-model")).toBe("google/gemini-3.7-flash");
    expect(response.headers.get("x-report-type")).toBe("DAILY_DIGEST");

    const metadataBase64 = response.headers.get("x-report-metadata");
    expect(metadataBase64).toBeDefined();
    const parsedMetadata = JSON.parse(Buffer.from(metadataBase64!, "base64").toString("utf-8"));
    expect(parsedMetadata.summary).toBeDefined();
    expect(parsedMetadata.modelUsed).toBe("google/gemini-3.7-flash");

    // Read streamed markdown body
    const reader = response.body?.getReader();
    expect(reader).toBeDefined();
    const decoder = new TextDecoder();
    let bodyText = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      bodyText += decoder.decode(value, { stream: true });
    }

    expect(bodyText).toContain("# Daily Executive Intelligence Digest");
    expect(bodyText).toContain(testEvent.title);
    expect(bodyText).toContain("Gemini 3.7 Flash");
  });

  it("POST /api/ai/reports generates streaming Sentiment Feedback analysis", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/reports", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        model: "deepseek/deepseek-v4-pro-0813",
        reportType: "SENTIMENT",
        focusArea: "Integration Test Breakout Feedback",
        saveToHistory: true,
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-report-type")).toBe("SENTIMENT");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let bodyText = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      bodyText += decoder.decode(value, { stream: true });
    }

    expect(bodyText).toContain("# Attendee Sentiment & Qualitative Feedback Synthesis");
    expect(bodyText).toContain("DeepSeek V4 Pro");
  });

  it("POST /api/ai/reports generates streaming Foot-Traffic and Booth optimization report", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/reports", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        model: "openai/gpt-5.6-luna",
        reportType: "FOOT_TRAFFIC",
        focusArea: "Integration Test Corridor Bottlenecks",
        saveToHistory: true,
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-report-type")).toBe("FOOT_TRAFFIC");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let bodyText = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      bodyText += decoder.decode(value, { stream: true });
    }

    expect(bodyText).toContain("# Exhibition Foot-Traffic & Hall Density Diagnostic");
    expect(bodyText).toContain("GPT-5.6 Luna");
  });

  it("GET /api/ai/reports retrieves saved reports for an event", async () => {
    const req = new NextRequest(`http://localhost:3000/api/ai/reports?eventId=${testEvent.id}`);
    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.reports)).toBe(true);
    expect(json.reports.length).toBeGreaterThanOrEqual(1);

    createdReportId = json.reports[0].id;
  });

  it("DELETE /api/ai/reports removes a saved report by ID", async () => {
    if (!createdReportId) return;

    const req = new NextRequest(`http://localhost:3000/api/ai/reports?reportId=${createdReportId}`, {
      method: "DELETE",
    });

    const response = await DELETE(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    // Verify deleted in DB
    const found = await db.aIReport.findUnique({
      where: { id: createdReportId },
    });
    expect(found).toBeNull();
  });

  it("POST /api/ai/reports returns 400 when invalid model is passed", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/reports", {
      method: "POST",
      body: JSON.stringify({
        eventId: testEvent.id,
        model: "invalid/non-existent-model",
        reportType: "DAILY_DIGEST",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });
});
