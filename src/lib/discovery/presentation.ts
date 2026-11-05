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
 * link-only (noindex, no structured data). Rows with no recorded tier are
 * legacy and render; an unrecognised non-null value stays unlisted so
 * discovery never defaults to leaking. */
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

export interface ScheduleStub extends DiscreetStub {
  id: string;
  discreet: true;
}

/** Type guard for schedule rows: stubs render occupancy, not links. */
export function isScheduleStub(
  row: unknown
): row is ScheduleStub {
  return (
    typeof row === "object" &&
    row !== null &&
    (row as { discreet?: unknown }).discreet === true
  );
}

/**
 * Schedule rows: public events pass through by identity, discreet events
 * become stubs, anything else (hidden, unknown) is dropped defensively so
 * a caller can never render what it must not show.
 */
export function toScheduleRows<
  T extends {
    id: string;
    visibility?: string | null;
    venueHallName?: string | null;
    startDate: Date | string;
    endDate: Date | string;
  },
>(rows: T[]): Array<T | ScheduleStub> {
  const out: Array<T | ScheduleStub> = [];
  for (const row of rows) {
    if (!row.visibility || row.visibility === "PUBLIC") {
      out.push(row);
    } else if (row.visibility === "DISCREET") {
      out.push({
        id: row.id,
        discreet: true,
        ...stripDiscreetFields(row),
      });
    }
  }
  return out;
}
