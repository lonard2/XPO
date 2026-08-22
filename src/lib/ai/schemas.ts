import { z } from "zod";

// ============================================================================
// 1. DAILY EXECUTIVE DIGEST SCHEMA
// ============================================================================

export const DailyExecutiveDigestSchema = z.object({
  summary: z.string().describe("High-level executive summary of daily event performance"),
  sentimentScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Normalized aggregate attendee sentiment index between 0.0 and 1.0"),
  footTrafficIndex: z
    .number()
    .positive()
    .describe("Estimated daily venue foot-traffic index / delegate encounters"),
  registrationVelocity: z.object({
    totalRegistrations: z.number().int().nonnegative(),
    totalCheckedIn: z.number().int().nonnegative(),
    checkInRatePercent: z.number().min(0).max(100),
    projectedFinalAttendance: z.number().int().positive(),
  }),
  revenueMetrics: z.object({
    grossRevenue: z.number().nonnegative(),
    currency: z.string().default("IDR"),
    averageTicketValue: z.number().nonnegative(),
    topTierByRevenue: z.string(),
  }),
  topSessions: z.array(
    z.object({
      title: z.string(),
      attendance: z.number().int().nonnegative(),
      location: z.string().optional(),
      speaker: z.string().optional(),
    })
  ).min(1),
  keyHighlights: z.array(z.string()).min(1),
  operationalRisks: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).min(2),
  modelUsed: z.string(),
  generatedAt: z.string(),
});

export type DailyExecutiveDigest = z.infer<typeof DailyExecutiveDigestSchema>;

// ============================================================================
// 2. ATTENDEE SENTIMENT & FEEDBACK SYNTHESIS SCHEMA
// ============================================================================

export const SentimentFeedbackSchema = z.object({
  summary: z.string().describe("Overview of qualitative attendee feedback and sentiment trends"),
  sentimentScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Normalized aggregate satisfaction score from 0.0 to 1.0"),
  attendeeSatisfactionIndex: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall attendee CSAT index on 0-100 scale"),
  positiveThemes: z.array(z.string()).min(1),
  criticalConcerns: z.array(z.string()).min(1),
  sessionRatings: z.array(
    z.object({
      sessionTitle: z.string(),
      sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
      satisfactionPercent: z.number().min(0).max(100),
      feedbackSample: z.string(),
    })
  ).min(1),
  facilitiesFeedback: z.object({
    wifiQuality: z.enum(["EXCELLENT", "ADEQUATE", "POOR"]),
    fnbRatingPercent: z.number().min(0).max(100),
    wayfindingClarity: z.enum(["SEAMLESS", "MODERATE", "CONFUSING"]),
  }),
  urgentActionItems: z.array(z.string()).min(1),
  modelUsed: z.string(),
  generatedAt: z.string(),
});

export type SentimentFeedback = z.infer<typeof SentimentFeedbackSchema>;

// ============================================================================
// 3. FOOT-TRAFFIC & BOOTH OPTIMIZATION SCHEMA
// ============================================================================

export const FootTrafficOptimizationSchema = z.object({
  summary: z.string().describe("Diagnostic breakdown of exhibition hall traffic and booth density"),
  overallCongestionLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  peakCongestionHours: z.array(z.string()).min(1),
  hallUtilization: z.array(
    z.object({
      hallName: z.string(),
      utilizationPercent: z.number().min(0).max(100),
      status: z.enum(["OPTIMAL", "CONGESTED", "UNDERUTILIZED"]),
      averageDwellMinutes: z.number().positive(),
    })
  ).min(1),
  bottleneckLocations: z.array(
    z.object({
      areaName: z.string(),
      severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
      suggestedMitigation: z.string(),
    })
  ).min(1),
  topPerformingBooths: z.array(
    z.object({
      boothNumber: z.string(),
      companyName: z.string(),
      estimatedVisitors: z.number().int().nonnegative(),
      engagementRating: z.enum(["HIGH", "VERY_HIGH", "EXCEPTIONAL"]),
    })
  ).default([]),
  boothTrafficRecommendations: z.array(z.string()).min(2),
  modelUsed: z.string(),
  generatedAt: z.string(),
});

export type FootTrafficOptimization = z.infer<typeof FootTrafficOptimizationSchema>;

// Helper map for schemas by ReportType
export const REPORT_SCHEMAS = {
  DAILY_DIGEST: DailyExecutiveDigestSchema,
  SENTIMENT: SentimentFeedbackSchema,
  FOOT_TRAFFIC: FootTrafficOptimizationSchema,
} as const;
