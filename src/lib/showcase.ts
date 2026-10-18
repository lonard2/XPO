import { z } from "zod";

/** Row caps keep showcase sections scannable and bounded. */
export const SHOWCASE_LIMITS = {
  programs: 12,
  alerts: 8,
  channels: 8,
} as const;

const ProgramRowSchema = z.object({
  kind: z.enum(["bounty", "lineup", "runway", "pitch", "demo", "generic"]),
  title: z.string().trim().min(1).max(120),
  detail: z.string().trim().max(500).default(""),
  sponsor: z.string().trim().max(120).optional(),
});

const ChannelRowSchema = z.object({
  code: z.string().trim().min(1).max(12),
  lang: z.string().trim().min(1).max(80),
  note: z.string().trim().max(200).default(""),
});

const httpUrl = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v),
    "Must be an http(s) URL"
  );

export const ShowcaseContentSchema = z.object({
  livestreamUrl: httpUrl.optional().default(""),
  livestreamLive: z.boolean().optional().default(false),
  programs: z.array(ProgramRowSchema).max(SHOWCASE_LIMITS.programs).default([]),
  alerts: z
    .array(z.string().trim().min(1).max(280))
    .max(SHOWCASE_LIMITS.alerts)
    .default([]),
  channels: z.array(ChannelRowSchema).max(SHOWCASE_LIMITS.channels).default([]),
  updatedAt: z.string().optional(),
  // Organizer attestation: the publisher confirms accuracy. Set server-side
  // from the caller on every save; client values are never trusted.
  attested: z.boolean().optional().default(false),
  attestedBy: z.string().optional().default(""),
  attestedAt: z.string().optional(),
});

export type ShowcaseContent = z.infer<typeof ShowcaseContentSchema>;
export type ShowcaseProgram = z.infer<typeof ProgramRowSchema>;
export type ShowcaseChannel = z.infer<typeof ChannelRowSchema>;

/** Parse stored JSON leniently: unparseable input yields an empty showcase. */
export function parseShowcase(value: unknown): ShowcaseContent {
  if (!value) return ShowcaseContentSchema.parse({});
  try {
    const raw = typeof value === "string" ? JSON.parse(value) : value;
    return ShowcaseContentSchema.parse(raw);
  } catch {
    return ShowcaseContentSchema.parse({});
  }
}

/** Validate authoring input strictly, returning field issues for the UI. */
export function validateShowcase(value: unknown): {
  ok: boolean;
  data?: ShowcaseContent;
  issues?: Record<string, string>;
} {
  const result = ShowcaseContentSchema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  const issues: Record<string, string> = {};
  for (const issue of result.error.issues) {
    issues[issue.path.join(".") || "showcase"] = issue.message;
  }
  return { ok: false, issues };
}

/** A showcase with no rows, alerts, channels, or stream renders nothing. */
export function isEmptyShowcase(s: ShowcaseContent): boolean {
  return (
    !s.livestreamUrl &&
    s.programs.length === 0 &&
    s.alerts.length === 0 &&
    s.channels.length === 0
  );
}

/** Minimal stamp shape for age helpers (subset of ShowcaseContent). */
export interface ShowcaseStamp {
  attestedAt?: string | null;
  updatedAt?: string | null;
}

/** Days since the showcase was last attested, or null when never. */
export function showcaseAgeDays(s: ShowcaseStamp, now = Date.now()): number | null {
  const stamp = s.attestedAt || s.updatedAt;
  if (!stamp) return null;
  const t = new Date(stamp).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now - t) / 86400000));
}

/** Content older than this reads as stale in views. */
export const SHOWCASE_STALE_DAYS = 180;

/** Short date for age stamps (locale-aware, never throws). */
export function showcaseDateLabel(s: ShowcaseStamp, locale = "en"): string | null {
  const stamp = s.attestedAt || s.updatedAt;
  if (!stamp) return null;
  try {
    return new Date(stamp).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}
