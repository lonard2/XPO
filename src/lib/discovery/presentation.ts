/**
 * Event presentation tiers and visibility.
 *
 * Sizes are explicit human choices: an event tier beats the venue
 * suggestion, the venue suggestion beats nothing chosen, and LARGE is the
 * safe default so migrations never shrink a page. Visibility separates
 * discovery (PUBLIC everywhere, DISCREET as occupancy, HIDDEN link-only).
 */

export const PAGE_SIZES = ["LARGE", "MEDIUM", "SMALL"] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const VISIBILITY = ["PUBLIC", "DISCREET", "HIDDEN"] as const;
export type EventVisibility =
  (typeof VISIBILITY)[number];

export interface PageSizeInput {
  eventTier?: string | null;
  venueSize?: string | null;
}

function isPageSize(value: unknown): value is PageSize {
  return (
    typeof value === "string" &&
    (PAGE_SIZES as readonly string[]).includes(value)
  );
}

export function resolvePageSize(input: PageSizeInput): PageSize {
  if (isPageSize(input.eventTier)) return input.eventTier;
  if (isPageSize(input.venueSize)) return input.venueSize;
  return "LARGE";
}

/** Public listings: discreet and hidden rows are excluded. */
export function listingWhere(): { visibility: string } {
  return { visibility: "PUBLIC" };
}

/** Detail-page routing by tier: discreet URLs 404, hidden URLs render
 * link-only (noindex, no structured data). Unknown tiers stay unlisted:
 * discovery defaults to hiding, never leaking. */
export function resolveDetailVisibility(
  visibility: string | null | undefined
): "render" | "notFound" | "unlisted" {
  if (!visibility || visibility === "PUBLIC") return "render";
  if (visibility === "DISCREET") return "notFound";
  return "unlisted";
}

/** Schedules show occupancy: public rows in full, discreet rows as stubs. */
export function scheduleWhere(): { visibility: { in: string[] } } {
  return { visibility: { in: ["PUBLIC", "DISCREET"] } };
}

export interface DiscreetStub {
  venueHallName?: string | null;
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Occupancy without identity. Everything a discreet row could leak —
 * title, organizer, imagery, copy, commercial and program detail — stays
 * out of the returned shape by construction.
 */
export function stripDiscreetFields(
  row: Record<string, unknown> & {
    venueHallName?: string | null;
    startDate: Date | string;
    endDate: Date | string;
  }
): DiscreetStub {
  return {
    venueHallName: row.venueHallName ?? null,
    startDate: row.startDate,
    endDate: row.endDate,
  };
}
