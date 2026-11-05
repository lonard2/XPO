/**
 * Homepage row resolvers.
 *
 * The cross-region rail is computed, never stored: one other region per
 * day, ranked by real demand with a featured fallback. Editor rows are
 * stored and merged by position, region-specific first on a tie.
 */

export const MAX_ROW_TITLE = 80;
export const MAX_ROW_SUBTITLE = 160;
export const MAX_ROW_EVENTS = 8;
export const RAIL_SIZE = 3;

export const HOMEPAGE_REGIONS = ["id", "jp", "global"] as const;
export type HomepageRegion = (typeof HOMEPAGE_REGIONS)[number];

/** Every region except the active one, in stable order. */
export function railCandidates(activeRegion: string): string[] {
  return HOMEPAGE_REGIONS.filter((region) => region !== activeRegion);
}

/**
 * Daily rotation: stable within a UTC day, different across days. The
 * active region is removed before indexing, so it can never be picked.
 */
export function pickRailRegion(activeRegion: string, date: Date): string {
  const candidates = railCandidates(activeRegion);
  if (candidates.length === 0) return activeRegion;
  const day = date.toISOString().slice(0, 10);
  const seed = `${day}:${activeRegion}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return candidates[hash % candidates.length];
}

export interface RankableRailEvent {
  isFeatured: boolean;
  startDate: Date | string;
  bookingCount: number;
}

function compareRank(a: RankableRailEvent, b: RankableRailEvent): number {
  if (b.bookingCount !== a.bookingCount) {
    return b.bookingCount - a.bookingCount;
  }
  return (
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

/**
 * Featured events first by demand, then non-featured appended only to
 * reach RAIL_SIZE. Never returns more than RAIL_SIZE.
 */
export function rankRailEvents<T extends RankableRailEvent>(
  events: T[]
): T[] {
  const featured = events.filter((event) => event.isFeatured).sort(compareRank);
  if (featured.length >= RAIL_SIZE) return featured.slice(0, RAIL_SIZE);
  const rest = events
    .filter((event) => !event.isFeatured)
    .sort(compareRank);
  return [...featured, ...rest].slice(0, RAIL_SIZE);
}

export interface MergeableRow {
  regionId: string | null;
  position: number;
}

/** Position order; region-specific rows win a tie against all-editions. */
export function mergeRows<T extends MergeableRow>(
  regionRows: T[],
  allRows: T[]
): T[] {
  return [...regionRows, ...allRows].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    if (a.regionId === null && b.regionId !== null) return 1;
    if (a.regionId !== null && b.regionId === null) return -1;
    return 0;
  });
}

export interface RowCopy {
  title: string;
  titleI18n?: Record<string, string> | null;
  subtitle?: string | null;
  subtitleI18n?: Record<string, string> | null;
}

function pickCopy(
  value: string | null | undefined,
  overrides: Record<string, string> | null | undefined,
  locale: string
): string | null {
  const override = overrides?.[locale];
  if (override && override.trim().length > 0) return override;
  if (value && value.trim().length > 0) return value;
  return null;
}

/** Exact locale, then default; empty overrides count as unset. */
export function resolveRowCopy(
  row: RowCopy,
  locale: string
): { title: string; subtitle: string | null } {
  return {
    title: pickCopy(row.title, row.titleI18n, locale) ?? row.title,
    subtitle: pickCopy(row.subtitle, row.subtitleI18n, locale),
  };
}
