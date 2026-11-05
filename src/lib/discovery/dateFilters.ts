/**
 * Event list date filters.
 *
 * Status filters answer "can I still attend?"; window filters answer "how
 * soon?". Windows are overlap-based, so a multi-day expo that starts before
 * the window and runs through it still matches.
 */

export const DATE_RANGE_IDS = [
  "all",
  "upcoming",
  "ongoing",
  "concluded",
  "next_7_days",
  "next_30_days",
  "next_90_days",
  "this_week",
  "this_month",
  "next_month",
  "this_year",
] as const;

export type DateRangeId = (typeof DATE_RANGE_IDS)[number];

export interface DatedEvent {
  startDate: Date | string;
  endDate: Date | string;
}

function bounds(event: DatedEvent): { start: number; end: number } | null {
  const start = new Date(event.startDate).getTime();
  if (Number.isNaN(start)) return null;
  const endDate = new Date(event.endDate).getTime();
  const end = Number.isNaN(endDate) ? start : endDate;
  return { start, end };
}

function dayStart(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

function overlaps(
  event: { start: number; end: number },
  from: number,
  to: number
): boolean {
  return event.end >= from && event.start <= to;
}

export function matchesDateRange(
  event: DatedEvent,
  range: string,
  now: Date = new Date()
): boolean {
  if (range === "all" || !range) return true;
  const span = bounds(event);
  if (!span) return false;
  const nowMs = now.getTime();

  switch (range) {
    case "upcoming":
      return span.start > nowMs;
    case "ongoing":
      return span.start <= nowMs && span.end >= nowMs;
    case "concluded":
      return span.end < nowMs;
    case "next_7_days":
      return overlaps(span, nowMs, nowMs + 7 * 86400000);
    case "next_30_days":
      return overlaps(span, nowMs, nowMs + 30 * 86400000);
    case "next_90_days":
      return overlaps(span, nowMs, nowMs + 90 * 86400000);
    case "this_week": {
      const start = dayStart(now);
      // Monday-based week.
      const offset = (now.getDay() + 6) % 7;
      const monday = start - offset * 86400000;
      return overlaps(span, monday, monday + 7 * 86400000 - 1);
    }
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const to = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ).getTime();
      return overlaps(span, from, to);
    }
    case "next_month": {
      const from = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ).getTime();
      const to = new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        0,
        23,
        59,
        59,
        999
      ).getTime();
      return overlaps(span, from, to);
    }
    case "this_year": {
      const from = new Date(now.getFullYear(), 0, 1).getTime();
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
      return overlaps(span, from, to);
    }
    default:
      // Unknown ranges are ignored rather than hiding everything.
      return true;
  }
}
