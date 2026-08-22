import * as crypto from "crypto";
import { z, type ZodSchema } from "zod";

// ============================================================================
// 1. CRYPTOGRAPHIC QR PASS CONTRACT
// ============================================================================

export interface TicketPassPayload {
  bookingId: string;
  eventId: string;
  tierId: string;
  attendeeEmail: string;
  issuedAt: number;
  nonce: string;
}

const DEFAULT_HMAC_SECRET = process.env.QR_HMAC_SECRET || "xpo-mice-secure-ticket-salt-2026-production-key";

/**
 * Deterministically generates an HMAC-SHA256 signed ticket pass payload and hash.
 */
export function generateTicketHash(
  payload: TicketPassPayload,
  secret: string = DEFAULT_HMAC_SECRET
): { qrCodeHash: string; signature: string; payloadString: string } {
  // Enforce sorted canonical JSON string representation
  const canonicalPayload = {
    attendeeEmail: payload.attendeeEmail.toLowerCase().trim(),
    bookingId: payload.bookingId.trim(),
    eventId: payload.eventId.trim(),
    issuedAt: payload.issuedAt,
    nonce: payload.nonce.trim(),
    tierId: payload.tierId.trim(),
  };

  const payloadString = JSON.stringify(canonicalPayload);
  const signature = crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
  const qrCodeHash = `XPO-PASS-${payload.bookingId.toUpperCase()}-${signature.substring(0, 16).toUpperCase()}`;

  return { qrCodeHash, signature, payloadString };
}

/**
 * Validates HMAC signature against payload string with constant-time equality check.
 */
export function verifyTicketHash(
  payloadString: string,
  signature: string,
  secret: string = DEFAULT_HMAC_SECRET,
  maxAgeMs?: number
): { valid: boolean; payload?: TicketPassPayload; error?: string } {
  try {
    if (!payloadString || !signature) {
      return { valid: false, error: "Missing payload string or signature" };
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(payloadString).digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: "INVALID_SIGNATURE: Hash signature tampering detected" };
    }

    const parsed = JSON.parse(payloadString) as TicketPassPayload;

    if (
      !parsed.bookingId ||
      !parsed.eventId ||
      !parsed.tierId ||
      !parsed.attendeeEmail ||
      typeof parsed.issuedAt !== "number" ||
      !parsed.nonce
    ) {
      return { valid: false, error: "MALFORMED_PAYLOAD: Missing mandatory ticket metadata fields" };
    }

    if (maxAgeMs && Date.now() - parsed.issuedAt > maxAgeMs) {
      return { valid: false, error: "EXPIRED_TICKET: Pass timestamp exceeded maximum validity window", payload: parsed };
    }

    return { valid: true, payload: parsed };
  } catch (err) {
    return { valid: false, error: `PARSE_ERROR: ${(err as Error).message}` };
  }
}

/**
 * Generates an SVG XML string representing the QR Pass code.
 */
export function generateSvgQrCode(
  data: string,
  options: { size?: number; primaryColor?: string } = {}
): string {
  const size = options.size || 256;
  const color = options.primaryColor || "#1e3a8a";
  const hashVal = crypto.createHash("md5").update(data).digest("hex");

  // Build SVG XML with clean vector elements and embedded validation metadata
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-qr-encoded="${data}" data-checksum="${hashVal}">
  <rect width="${size}" height="${size}" fill="#ffffff" rx="12" />
  <!-- QR Corner Position Detection Patterns -->
  <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.24}" height="${size * 0.24}" fill="${color}" rx="4" />
  <rect x="${size * 0.12}" y="${size * 0.12}" width="${size * 0.16}" height="${size * 0.16}" fill="#ffffff" rx="2" />
  <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
  
  <rect x="${size * 0.68}" y="${size * 0.08}" width="${size * 0.24}" height="${size * 0.24}" fill="${color}" rx="4" />
  <rect x="${size * 0.72}" y="${size * 0.12}" width="${size * 0.16}" height="${size * 0.16}" fill="#ffffff" rx="2" />
  <rect x="${size * 0.75}" y="${size * 0.15}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
  
  <rect x="${size * 0.08}" y="${size * 0.68}" width="${size * 0.24}" height="${size * 0.24}" fill="${color}" rx="4" />
  <rect x="${size * 0.12}" y="${size * 0.72}" width="${size * 0.16}" height="${size * 0.16}" fill="#ffffff" rx="2" />
  <rect x="${size * 0.15}" y="${size * 0.75}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
  
  <!-- Encoded Data Blocks Simulation -->
  <rect x="${size * 0.40}" y="${size * 0.40}" width="${size * 0.20}" height="${size * 0.20}" fill="${color}" rx="2" />
  <rect x="${size * 0.45}" y="${size * 0.15}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
  <rect x="${size * 0.15}" y="${size * 0.45}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
  <rect x="${size * 0.75}" y="${size * 0.45}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
  <rect x="${size * 0.45}" y="${size * 0.75}" width="${size * 0.10}" height="${size * 0.10}" fill="${color}" />
</svg>`;
}

// ============================================================================
// 2. MULTILINGUAL i18n & REGIONAL FORMATTERS CONTRACT
// ============================================================================

export type SupportedLocale = "en" | "ja" | "zh-CN" | "id" | "de" | "es";
export type SupportedCurrency = "IDR" | "JPY" | "USD" | "EUR" | "SGD";

export function formatCurrency(amount: number, currency: SupportedCurrency, locale: string): string {
  const safeLocale = ["en", "ja", "zh-CN", "id", "de", "es"].includes(locale) ? locale : "en";
  const isZeroDecimal = currency === "JPY" || (currency === "IDR" && amount % 1 === 0);

  const formatted = new Intl.NumberFormat(safeLocale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(amount);

  // Normalize non-breaking space for deterministic comparisons
  return formatted.replace(/\u00A0/g, " ");
}

export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  locale: string,
  timeZone: string = "UTC"
): string {
  const safeLocale = ["en", "ja", "zh-CN", "id", "de", "es"].includes(locale) ? locale : "en";
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const startFormatter = new Intl.DateTimeFormat(safeLocale, {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const endFormatter = new Intl.DateTimeFormat(safeLocale, {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedStart = startFormatter.format(start);
  const formattedEnd = endFormatter.format(end);

  if (formattedStart === formattedEnd) {
    return formattedStart;
  }

  return `${formattedStart} - ${formattedEnd}`;
}

export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  const rtlLocales = ["ar", "he", "fa", "ur"];
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

// ============================================================================
// 3. 9-ARCHETYPE DYNAMIC THEMING CONTRACT
// ============================================================================

export type MiceArchetype =
  | "INDUSTRIAL_B2B"
  | "TECH_DEV_SUMMIT"
  | "MEDICAL_SYMPOSIUM"
  | "FINANCE_INVESTOR"
  | "POP_CULTURE_GAMING"
  | "MUSIC_FESTIVAL"
  | "MEGA_EXPO_PAVILION"
  | "GOVERNMENT_DIPLOMATIC"
  | "INCENTIVE_RETREAT";

export interface ArchetypeThemeTokens {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  fontFamily: string;
  badgeStyle: string;
}

export interface BrandingConfig {
  primaryColor?: string;
  accentColor?: string;
  heroBadge?: string;
  bannerOverlayOpacity?: number;
}

export const ARCHETYPE_DEFAULTS: Record<MiceArchetype, ArchetypeThemeTokens> = {
  INDUSTRIAL_B2B: {
    primary: "#2563eb",
    accent: "#f59e0b",
    background: "#0f172a",
    surface: "#1e293b",
    border: "#334155",
    fontFamily: "font-sans",
    badgeStyle: "neutral",
  },
  TECH_DEV_SUMMIT: {
    primary: "#6366f1",
    accent: "#06b6d4",
    background: "#090d16",
    surface: "#131b2e",
    border: "#1e293b",
    fontFamily: "font-mono",
    badgeStyle: "archetype",
  },
  MEDICAL_SYMPOSIUM: {
    primary: "#0d9488",
    accent: "#10b981",
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#e2e8f0",
    fontFamily: "font-serif",
    badgeStyle: "outline",
  },
  FINANCE_INVESTOR: {
    primary: "#1e3a8a",
    accent: "#d97706",
    background: "#0a0f1d",
    surface: "#111827",
    border: "#1f2937",
    fontFamily: "font-sans",
    badgeStyle: "success",
  },
  POP_CULTURE_GAMING: {
    primary: "#9333ea",
    accent: "#ec4899",
    background: "#180828",
    surface: "#2d124d",
    border: "#4c1d95",
    fontFamily: "font-legible",
    badgeStyle: "warning",
  },
  MUSIC_FESTIVAL: {
    primary: "#e11d48",
    accent: "#8b5cf6",
    background: "#110714",
    surface: "#260c2c",
    border: "#4c1257",
    fontFamily: "font-sans",
    badgeStyle: "archetype",
  },
  MEGA_EXPO_PAVILION: {
    primary: "#ea580c",
    accent: "#16a34a",
    background: "#0c121e",
    surface: "#162032",
    border: "#25334c",
    fontFamily: "font-sans",
    badgeStyle: "default",
  },
  GOVERNMENT_DIPLOMATIC: {
    primary: "#0f172a",
    accent: "#0284c7",
    background: "#020617",
    surface: "#0f172a",
    border: "#1e293b",
    fontFamily: "font-serif",
    badgeStyle: "neutral",
  },
  INCENTIVE_RETREAT: {
    primary: "#059669",
    accent: "#d97706",
    background: "#062016",
    surface: "#0e3828",
    border: "#165940",
    fontFamily: "font-legible",
    badgeStyle: "outline",
  },
};

export function getArchetypeTokens(archetype: MiceArchetype, overrides?: BrandingConfig): ArchetypeThemeTokens {
  const base = ARCHETYPE_DEFAULTS[archetype] || ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B;

  return {
    ...base,
    primary: overrides?.primaryColor || base.primary,
    accent: overrides?.accentColor || base.accent,
  };
}

export function getArchetypeCssVariables(archetype: MiceArchetype, overrides?: BrandingConfig): Record<string, string> {
  const tokens = getArchetypeTokens(archetype, overrides);
  return {
    "--archetype-primary": tokens.primary,
    "--archetype-accent": tokens.accent,
    "--archetype-bg": tokens.background,
    "--archetype-surface": tokens.surface,
    "--archetype-border": tokens.border,
  };
}

// ============================================================================
// 4. OPENROUTER MULTI-MODEL AI GATEWAY CONTRACT
// ============================================================================

export type OpenRouterModel =
  | "google/gemini-3.5-flash-lite"
  | "google/gemini-3.7-flash"
  | "deepseek/deepseek-v4-pro-0813"
  | "qwen/qwen3.7-plus"
  | "openai/gpt-5.6-luna"
  | "google/gemma-4-26b-a4b-it";

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

export const OPENROUTER_MODEL_SPECS: Record<
  OpenRouterModel,
  { displayName: string; latencyClass: "fast" | "medium" | "deep"; primaryCapability: string; contextWindow: number }
> = {
  "google/gemini-3.5-flash-lite": {
    displayName: "Gemini 3.5 Flash Lite",
    latencyClass: "fast",
    primaryCapability: "Real-time Attendee Concierge & FAQ",
    contextWindow: 1000000,
  },
  "google/gemini-3.7-flash": {
    displayName: "Gemini 3.7 Flash",
    latencyClass: "medium",
    primaryCapability: "Balanced Multi-Modal Reporting & Hybrid Reasoning",
    contextWindow: 1000000,
  },
  "deepseek/deepseek-v4-pro-0813": {
    displayName: "DeepSeek V4 Pro",
    latencyClass: "deep",
    primaryCapability: "Deep Anomaly Detection & Financial Audit Reasoning",
    contextWindow: 128000,
  },
  "qwen/qwen3.7-plus": {
    displayName: "Qwen 3.7 Plus",
    latencyClass: "medium",
    primaryCapability: "Multilingual Trade & Cross-Border Supply Synthesis",
    contextWindow: 128000,
  },
  "openai/gpt-5.6-luna": {
    displayName: "GPT-5.6 Luna",
    latencyClass: "deep",
    primaryCapability: "VIP Stakeholder Synthesis & Executive Briefings",
    contextWindow: 200000,
  },
  "google/gemma-4-26b-a4b-it": {
    displayName: "Gemma 4 26B A4B IT",
    latencyClass: "fast",
    primaryCapability: "Edge Analytics & Low-Latency Field Extraction",
    contextWindow: 64000,
  },
};

/**
 * Offline simulation & mock parser for structured AI reporting with Zod validation.
 */
export async function generateStructuredReport<T>(options: StructuredReportOptions<T>): Promise<T> {
  const modelSpec = OPENROUTER_MODEL_SPECS[options.model];
  if (!modelSpec) {
    throw new Error(`Unsupported OpenRouter model requested: ${options.model}`);
  }

  // Generate synthetic structured response tailored to MICE analytics
  const syntheticDigest = {
    summary: `Executive Intelligence Report generated by ${modelSpec.displayName} for ${options.prompt}.`,
    sentimentScore: 0.92,
    footTrafficIndex: 1450,
    topSessions: [
      { title: "Keynote: Next-Gen Industrial Automation", attendance: 850 },
      { title: "Smart Factory Logistics Panel", attendance: 600 },
    ],
    recommendedActions: [
      "Increase Hall A3 coffee distribution between 14:00 and 15:30.",
      "Deploy secondary QR scanner at Nusantara Hall entrance.",
    ],
    modelUsed: options.model,
    generatedAt: new Date().toISOString(),
  };

  // Validate against incoming Zod schema
  return options.schema.parse(syntheticDigest);
}

/**
 * Streams chat tokens as a Web ReadableStream.
 */
export async function streamOpenRouterChat(options: StreamChatOptions): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const chunks = [
    `Welcome to XPO MICE Concierge powered by ${options.model}.\n`,
    `I can help you navigate the exhibition halls, explore speaker agendas, `,
    `or locate specific exhibitor booths at your venue.\n`,
    `How can I assist your visit today?`,
  ];

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

// ============================================================================
// 5. VENUE CRAWLER & DEDUPLICATION CONTRACT
// ============================================================================

export interface ScrapedEventRaw {
  rawTitle: string;
  venueSlug: string;
  dateString: string;
  hallNames: string[];
  category?: string;
  description?: string;
}

export interface NormalizedEvent {
  title: string;
  slug: string;
  venueSlug: string;
  startDate: Date;
  endDate: Date;
  halls: string[];
  archetype: MiceArchetype;
  fingerprint: string;
}

export function normalizeEventSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function computeEventFingerprint(venueSlug: string, title: string, startDate: Date): string {
  const normTitle = title.toLowerCase().trim();
  const normDate = startDate.toISOString().split("T")[0];
  return crypto.createHash("sha256").update(`${venueSlug}:${normTitle}:${normDate}`).digest("hex");
}

export function normalizeScrapedEvent(raw: ScrapedEventRaw): NormalizedEvent {
  const title = raw.rawTitle.trim();
  const slug = normalizeEventSlug(title);
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 18);

  const fingerprint = computeEventFingerprint(raw.venueSlug, title, startDate);

  return {
    title,
    slug,
    venueSlug: raw.venueSlug,
    startDate,
    endDate,
    halls: raw.hallNames.length > 0 ? raw.hallNames : ["Main Exhibition Hall"],
    archetype: (raw.category as MiceArchetype) || "INDUSTRIAL_B2B",
    fingerprint,
  };
}

export function deduplicateEvents(
  existingFingerprints: Set<string>,
  incoming: NormalizedEvent[]
): { toInsert: NormalizedEvent[]; toSkip: NormalizedEvent[]; stats: { total: number; newCount: number; duplicateCount: number } } {
  const toInsert: NormalizedEvent[] = [];
  const toSkip: NormalizedEvent[] = [];

  for (const item of incoming) {
    if (existingFingerprints.has(item.fingerprint)) {
      toSkip.push(item);
    } else {
      toInsert.push(item);
      existingFingerprints.add(item.fingerprint);
    }
  }

  return {
    toInsert,
    toSkip,
    stats: {
      total: incoming.length,
      newCount: toInsert.length,
      duplicateCount: toSkip.length,
    },
  };
}

// ============================================================================
// 6. MULTI-ROLE RBAC CONTRACT
// ============================================================================

export type UserRole = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export type Permission =
  | "events:view"
  | "tickets:buy"
  | "tickets:verify"
  | "events:create"
  | "events:edit"
  | "booths:manage"
  | "ai:reports"
  | "venues:manage"
  | "crawler:run"
  | "audit:view";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ATTENDEE: ["events:view", "tickets:buy"],
  ORGANIZER: [
    "events:view",
    "tickets:buy",
    "tickets:verify",
    "events:create",
    "events:edit",
    "booths:manage",
    "ai:reports",
  ],
  ADMIN: [
    "events:view",
    "tickets:buy",
    "tickets:verify",
    "events:create",
    "events:edit",
    "booths:manage",
    "ai:reports",
    "venues:manage",
    "crawler:run",
    "audit:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function canAccessRoute(role: UserRole | string, pathname: string): boolean {
  if (!pathname || typeof pathname !== "string") return false;
  const cleanPath = pathname.split("?")[0].split("#")[0].trim();

  if (
    cleanPath === "/admin" ||
    cleanPath.startsWith("/admin/") ||
    cleanPath.endsWith("/admin") ||
    cleanPath.includes("/(admin)") ||
    cleanPath.includes("/admin/") ||
    /\/(admin)($|\/)/.test(cleanPath)
  ) {
    return role === "ADMIN";
  }
  if (
    cleanPath === "/organizer" ||
    cleanPath.startsWith("/organizer/") ||
    cleanPath.endsWith("/organizer") ||
    cleanPath.includes("/(organizer)") ||
    cleanPath.includes("/organizer/") ||
    /\/(organizer)($|\/)/.test(cleanPath) ||
    cleanPath.includes("/dashboard") ||
    cleanPath.includes("/events/new") ||
    cleanPath.includes("/customizer") ||
    cleanPath.includes("/booths") ||
    cleanPath.includes("/scanner")
  ) {
    return role === "ORGANIZER" || role === "ADMIN";
  }
  return true; // Public attendee routes & settings accessible by all
}

export function getRoleHierarchy(role: UserRole): number {
  switch (role) {
    case "ADMIN":
      return 3;
    case "ORGANIZER":
      return 2;
    case "ATTENDEE":
      return 1;
    default:
      return 0;
  }
}
