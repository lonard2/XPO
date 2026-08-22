import { z, type ZodSchema } from "zod";

// ============================================================================
// 1. OPENROUTER MODEL SPECIFICATIONS
// ============================================================================

export type OpenRouterModel =
  | "google/gemini-3.5-flash-lite"
  | "google/gemini-3.7-flash"
  | "deepseek/deepseek-v4-pro-0813"
  | "qwen/qwen3.7-plus"
  | "openai/gpt-5.6-luna"
  | "google/gemma-4-26b-a4b-it";

export type ReportType = "DAILY_DIGEST" | "SENTIMENT" | "FOOT_TRAFFIC";

export type LatencyClass = "fast" | "medium" | "deep";

export interface ModelSpec {
  id: OpenRouterModel;
  displayName: string;
  provider: string;
  latencyClass: LatencyClass;
  speedRating: string; // e.g. "Ultra-Fast (~250ms)", "Balanced (~800ms)", "Deep Reasoning (~2.5s)"
  primaryCapability: string;
  strengths: string[];
  contextWindow: number;
  recommendedFor: string;
  badgeVariant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "archetype" | "neutral";
}

export const OPENROUTER_MODEL_SPECS: Record<OpenRouterModel, ModelSpec> = {
  "google/gemini-3.5-flash-lite": {
    id: "google/gemini-3.5-flash-lite",
    displayName: "Gemini 3.5 Flash Lite",
    provider: "Google",
    latencyClass: "fast",
    speedRating: "Ultra-Fast (~250ms)",
    primaryCapability: "Real-time Attendee Concierge & FAQ",
    strengths: [
      "Sub-second streaming latency",
      "High throughput for concurrency",
      "Low token consumption cost",
      "Factual grounded Q&A extraction",
    ],
    contextWindow: 1000000,
    recommendedFor: "Live event day attendee concierges, real-time FAQs, and rapid instant digests.",
    badgeVariant: "success",
  },
  "google/gemini-3.7-flash": {
    id: "google/gemini-3.7-flash",
    displayName: "Gemini 3.7 Flash",
    provider: "Google",
    latencyClass: "medium",
    speedRating: "Balanced (~800ms)",
    primaryCapability: "Balanced Multi-Modal Reporting & Hybrid Reasoning",
    strengths: [
      "1M token context capacity",
      "Structured JSON compliance",
      "Multi-modal floor plan interpretation",
      "Balanced throughput and deep reasoning",
    ],
    contextWindow: 1000000,
    recommendedFor: "End-of-day organizer digests, comprehensive sponsor summaries, and multi-track synthesis.",
    badgeVariant: "archetype",
  },
  "deepseek/deepseek-v4-pro-0813": {
    id: "deepseek/deepseek-v4-pro-0813",
    displayName: "DeepSeek V4 Pro",
    provider: "DeepSeek",
    latencyClass: "deep",
    speedRating: "Deep Reasoning (~2.5s)",
    primaryCapability: "Deep Anomaly Detection & Financial Audit Reasoning",
    strengths: [
      "Rigorous mathematical validation",
      "Ticket velocity anomaly detection",
      "Gate fraud pattern identification",
      "Step-by-step root-cause diagnostics",
    ],
    contextWindow: 128000,
    recommendedFor: "Financial audits, registration velocity forensics, and revenue mismatch identification.",
    badgeVariant: "warning",
  },
  "qwen/qwen3.7-plus": {
    id: "qwen/qwen3.7-plus",
    displayName: "Qwen 3.7 Plus",
    provider: "Alibaba Cloud",
    latencyClass: "medium",
    speedRating: "Balanced (~900ms)",
    primaryCapability: "Multilingual Trade & Cross-Border Supply Synthesis",
    strengths: [
      "Native Asian language mastery (ID, JP, ZH, EN)",
      "B2B exhibitor matchmaking logic",
      "Cross-border bilateral procurement analysis",
      "High cultural context sensitivity",
    ],
    contextWindow: 128000,
    recommendedFor: "International trade expos, cross-border delegation briefings, and multilingual attendee surveys.",
    badgeVariant: "secondary",
  },
  "openai/gpt-5.6-luna": {
    id: "openai/gpt-5.6-luna",
    displayName: "GPT-5.6 Luna",
    provider: "OpenAI",
    latencyClass: "deep",
    speedRating: "Deep Reasoning (~2.2s)",
    primaryCapability: "VIP Stakeholder Synthesis & Executive Briefings",
    strengths: [
      "Institutional board-level narrative",
      "High-level strategic forecasting",
      "Actionable executive governance summaries",
      "Precise tone calibration",
    ],
    contextWindow: 200000,
    recommendedFor: "Post-event C-level executive summaries, government protocol reports, and investor decks.",
    badgeVariant: "neutral",
  },
  "google/gemma-4-26b-a4b-it": {
    id: "google/gemma-4-26b-a4b-it",
    displayName: "Gemma 4 26B A4B IT",
    provider: "Google Open Weights",
    latencyClass: "fast",
    speedRating: "Low Latency (~350ms)",
    primaryCapability: "Edge Analytics & Low-Latency Field Extraction",
    strengths: [
      "Edge-deployable lightweight inference",
      "Deterministic data extraction",
      "Zero external data transit compliance",
      "Rapid tabular metric compilation",
    ],
    contextWindow: 64000,
    recommendedFor: "On-premise door scanner analytics, localized sensor aggregation, and edge gate logs.",
    badgeVariant: "outline",
  },
};

// ============================================================================
// 2. CHAT & STREAMING TYPES
// ============================================================================

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamChatOptions {
  model: OpenRouterModel;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface StructuredReportOptions<T> {
  model: OpenRouterModel;
  prompt: string;
  schema: ZodSchema<T>;
  contextData?: Record<string, unknown>;
}

// ============================================================================
// 3. EVENT DATA INGESTION CONTEXT
// ============================================================================

export interface EventMetricsContext {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string;
  archetype: string;
  format: string;
  scale: string;
  startDate: string;
  endDate: string;
  venue: {
    id: string;
    name: string;
    city: string;
    transitInfo: string;
  };
  venueHall?: {
    id: string;
    name: string;
    capacity?: number | null;
  } | null;
  totalBookings: number;
  totalCheckedIn: number;
  checkInRatePercent: number;
  grossRevenue: number;
  currency: string;
  ticketTiers: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    capacity: number;
    soldCount: number;
  }>;
  booths: Array<{
    id: string;
    companyName: string;
    boothNumber: string;
    hallName: string;
    industry?: string | null;
  }>;
  agendaItems: Array<{
    id: string;
    title: string;
    speakerName?: string | null;
    location: string;
    startTime: string;
    endTime: string;
    track?: string | null;
  }>;
}

// ============================================================================
// 4. REPORT GENERATION REQUEST & RESPONSE
// ============================================================================

export interface ReportGenerationRequest {
  eventId: string;
  model: OpenRouterModel;
  reportType: ReportType;
  focusArea?: string;
}

export interface SavedAIReportItem {
  id: string;
  eventId: string;
  modelUsed: OpenRouterModel;
  reportType: ReportType;
  contentJson: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
  };
}
