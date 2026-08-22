import { describe, it, expect } from "vitest";
import {
  DailyExecutiveDigestSchema,
  SentimentFeedbackSchema,
  FootTrafficOptimizationSchema,
  REPORT_SCHEMAS,
} from "@/lib/ai/schemas";

describe("Phase 10 Unit: AI Multi-Model Zod Schemas Validation", () => {
  // ==========================================================================
  // DAILY EXECUTIVE DIGEST SCHEMA TESTS
  // ==========================================================================

  it("validates a complete DailyExecutiveDigest object successfully", () => {
    const validDigest = {
      summary: "Executive summary for Manufacturing Indonesia Day 1.",
      sentimentScore: 0.88,
      footTrafficIndex: 1850,
      registrationVelocity: {
        totalRegistrations: 2400,
        totalCheckedIn: 1870,
        checkInRatePercent: 78,
        projectedFinalAttendance: 2600,
      },
      revenueMetrics: {
        grossRevenue: 520000000,
        currency: "IDR",
        averageTicketValue: 278000,
        topTierByRevenue: "VIP Executive Buyer Pass",
      },
      topSessions: [
        {
          title: "Opening Plenary: Industrial AI & Smart Factories",
          attendance: 920,
          location: "Plenary Stage - Hall D2",
          speaker: "Dr. Alex Pratama",
        },
      ],
      keyHighlights: ["Record morning check-in rate of 78% within first 2 hours."],
      operationalRisks: ["Hall A coffee station wait time exceeded 7 minutes."],
      recommendedActions: [
        "Deploy additional roving check-in turnstile staff.",
        "Restock Hall A mezzanine coffee stations before 14:00.",
      ],
      modelUsed: "google/gemini-3.7-flash",
      generatedAt: new Date().toISOString(),
    };

    const parsed = DailyExecutiveDigestSchema.parse(validDigest);
    expect(parsed.summary).toBe(validDigest.summary);
    expect(parsed.sentimentScore).toBe(0.88);
    expect(parsed.recommendedActions.length).toBe(2);
  });

  it("enforces sentimentScore bounds (0 to 1) on DailyExecutiveDigest", () => {
    const invalidDigest = {
      summary: "Invalid score test",
      sentimentScore: 1.5, // Out of bounds
      footTrafficIndex: 100,
      registrationVelocity: {
        totalRegistrations: 100,
        totalCheckedIn: 80,
        checkInRatePercent: 80,
        projectedFinalAttendance: 100,
      },
      revenueMetrics: {
        grossRevenue: 1000,
        currency: "IDR",
        averageTicketValue: 10,
        topTierByRevenue: "Standard",
      },
      topSessions: [{ title: "Session", attendance: 50 }],
      keyHighlights: ["Highlight"],
      recommendedActions: ["Action 1", "Action 2"],
      modelUsed: "google/gemini-3.5-flash-lite",
      generatedAt: new Date().toISOString(),
    };

    expect(() => DailyExecutiveDigestSchema.parse(invalidDigest)).toThrow();
  });

  it("rejects DailyExecutiveDigest when fewer than 2 recommended actions are provided", () => {
    const invalidDigest = {
      summary: "Fewer actions test",
      sentimentScore: 0.75,
      footTrafficIndex: 100,
      registrationVelocity: {
        totalRegistrations: 100,
        totalCheckedIn: 80,
        checkInRatePercent: 80,
        projectedFinalAttendance: 100,
      },
      revenueMetrics: {
        grossRevenue: 1000,
        currency: "IDR",
        averageTicketValue: 10,
        topTierByRevenue: "Standard",
      },
      topSessions: [{ title: "Session", attendance: 50 }],
      keyHighlights: ["Highlight"],
      recommendedActions: ["Only one action"], // Requires min(2)
      modelUsed: "google/gemini-3.5-flash-lite",
      generatedAt: new Date().toISOString(),
    };

    expect(() => DailyExecutiveDigestSchema.parse(invalidDigest)).toThrow();
  });

  // ==========================================================================
  // SENTIMENT & FEEDBACK SYNTHESIS SCHEMA TESTS
  // ==========================================================================

  it("validates a compliant SentimentFeedback object successfully", () => {
    const validFeedback = {
      summary: "High satisfaction observed across all technical tracks.",
      sentimentScore: 0.94,
      attendeeSatisfactionIndex: 94,
      positiveThemes: ["Instant turnstile QR entry", "High-caliber keynote speaker roster"],
      criticalConcerns: ["Cold temperature in breakout hall B3"],
      sessionRatings: [
        {
          sessionTitle: "Smart Factory Logistics Roundtable",
          sentiment: "POSITIVE" as const,
          satisfactionPercent: 92,
          feedbackSample: "Excellent pragmatic frameworks.",
        },
      ],
      facilitiesFeedback: {
        wifiQuality: "EXCELLENT" as const,
        fnbRatingPercent: 89,
        wayfindingClarity: "SEAMLESS" as const,
      },
      urgentActionItems: ["Calibrate thermostat in Hall B3 to 23C"],
      modelUsed: "deepseek/deepseek-v4-pro-0813",
      generatedAt: new Date().toISOString(),
    };

    const parsed = SentimentFeedbackSchema.parse(validFeedback);
    expect(parsed.attendeeSatisfactionIndex).toBe(94);
    expect(parsed.facilitiesFeedback.wifiQuality).toBe("EXCELLENT");
    expect(parsed.sessionRatings[0].sentiment).toBe("POSITIVE");
  });

  it("rejects SentimentFeedback when attendeeSatisfactionIndex exceeds 100", () => {
    const invalidFeedback = {
      summary: "Invalid CSAT test",
      sentimentScore: 0.8,
      attendeeSatisfactionIndex: 120, // Max 100
      positiveThemes: ["Great"],
      criticalConcerns: ["None"],
      sessionRatings: [
        {
          sessionTitle: "Session 1",
          sentiment: "POSITIVE" as const,
          satisfactionPercent: 90,
          feedbackSample: "Good",
        },
      ],
      facilitiesFeedback: {
        wifiQuality: "ADEQUATE" as const,
        fnbRatingPercent: 80,
        wayfindingClarity: "MODERATE" as const,
      },
      urgentActionItems: ["Action 1"],
      modelUsed: "qwen/qwen3.7-plus",
      generatedAt: new Date().toISOString(),
    };

    expect(() => SentimentFeedbackSchema.parse(invalidFeedback)).toThrow();
  });

  // ==========================================================================
  // FOOT-TRAFFIC & BOOTH OPTIMIZATION SCHEMA TESTS
  // ==========================================================================

  it("validates a compliant FootTrafficOptimization object successfully", () => {
    const validTraffic = {
      summary: "Hall flow is stable with peak dwell in robotics pavilion.",
      overallCongestionLevel: "MODERATE" as const,
      peakCongestionHours: ["09:45 - 10:45", "13:30 - 14:30"],
      hallUtilization: [
        {
          hallName: "Hall A1 (Heavy Machinery)",
          utilizationPercent: 84,
          status: "CONGESTED" as const,
          averageDwellMinutes: 28.5,
        },
        {
          hallName: "Hall B1 (Sourcing Pavilion)",
          utilizationPercent: 55,
          status: "UNDERUTILIZED" as const,
          averageDwellMinutes: 14.0,
        },
      ],
      bottleneckLocations: [
        {
          areaName: "Connecting Bridge A1-A2",
          severity: "HIGH" as const,
          suggestedMitigation: "Widen corridor by removing temporary banner stands.",
        },
      ],
      topPerformingBooths: [
        {
          boothNumber: "A1-12",
          companyName: "Siemens Automation",
          estimatedVisitors: 750,
          engagementRating: "EXCEPTIONAL" as const,
        },
      ],
      boothTrafficRecommendations: [
        "Broadcast live machine demo alerts to drive traffic to Hall B1.",
        "Increase aisle clearance at booth row A1-10 to A1-16.",
      ],
      modelUsed: "openai/gpt-5.6-luna",
      generatedAt: new Date().toISOString(),
    };

    const parsed = FootTrafficOptimizationSchema.parse(validTraffic);
    expect(parsed.overallCongestionLevel).toBe("MODERATE");
    expect(parsed.hallUtilization.length).toBe(2);
    expect(parsed.bottleneckLocations[0].severity).toBe("HIGH");
  });

  it("verifies REPORT_SCHEMAS mapping contains all 3 report categories", () => {
    expect(REPORT_SCHEMAS.DAILY_DIGEST).toBeDefined();
    expect(REPORT_SCHEMAS.SENTIMENT).toBeDefined();
    expect(REPORT_SCHEMAS.FOOT_TRAFFIC).toBeDefined();
  });
});
