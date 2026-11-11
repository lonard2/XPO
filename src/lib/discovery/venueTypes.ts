/**
 * Venue and space vocabulary.
 *
 * Venue `type` is the kind of place: convention centre, stadium, mall,
 * outdoor ground, and so on. `Venue.size` is a separate presentation-tier
 * suggestion and never doubles as the type. `VenueHall.kind` is the kind of
 * sub-space: hall, arena, field, atrium, ballroom, and so on.
 *
 * These are string columns with a TypeScript union, matching the existing
 * `size`, `kind`, and `visibility` pattern. Validation lives at the API edge;
 * normalization is for backfills and read paths.
 */

export const VENUE_TYPES = [
  "CONVENTION_CENTER",
  "EXHIBITION_CENTER",
  "ARENA",
  "STADIUM",
  "MALL",
  "HOTEL",
  "COMMUNITY_HALL",
  "OUTDOOR",
] as const;

export type VenueType = (typeof VENUE_TYPES)[number];

export const SPACE_KINDS = [
  "HALL",
  "MEETING_ROOM",
  "ARENA",
  "FIELD",
  "COURT",
  "ATRIUM",
  "PAVILION",
  "BALLROOM",
  "OUTDOOR",
] as const;

export type SpaceKind = (typeof SPACE_KINDS)[number];

const VENUE_TYPE_SET = new Set<string>(VENUE_TYPES);
const SPACE_KIND_SET = new Set<string>(SPACE_KINDS);

/** Strict check for API payloads. Does not accept lowercase or unknown values. */
export function isVenueType(value: unknown): value is VenueType {
  return typeof value === "string" && VENUE_TYPE_SET.has(value);
}

/** Strict check for API payloads. Does not accept lowercase or unknown values. */
export function isSpaceKind(value: unknown): value is SpaceKind {
  return typeof value === "string" && SPACE_KIND_SET.has(value);
}

/** Case-insensitive normalization for backfills and read paths. */
export function normalizeVenueType(value: unknown): VenueType {
  if (typeof value !== "string") return "CONVENTION_CENTER";
  const upper = value.trim().toUpperCase();
  return VENUE_TYPE_SET.has(upper) ? (upper as VenueType) : "CONVENTION_CENTER";
}

/** Case-insensitive normalization for backfills and read paths. */
export function normalizeSpaceKind(value: unknown): SpaceKind {
  if (typeof value !== "string") return "HALL";
  const upper = value.trim().toUpperCase();
  return SPACE_KIND_SET.has(upper) ? (upper as SpaceKind) : "HALL";
}

/**
 * Convention and exhibition centres inventory halls. Every other venue type
 * inventories spaces: arenas, fields, courts, atriums, ballrooms, outdoor
 * decks, and so on.
 */
export function isHallVenue(type: VenueType): boolean {
  return type === "CONVENTION_CENTER" || type === "EXHIBITION_CENTER";
}

/** i18n key for the plural count label. */
export function countLabelKey(
  type: VenueType
): "hallsCount" | "spacesCount" {
  return isHallVenue(type) ? "hallsCount" : "spacesCount";
}

/** i18n key for the singular count label. */
export function countLabelOneKey(
  type: VenueType
): "hallsCountOne" | "spacesCountOne" {
  return isHallVenue(type) ? "hallsCountOne" : "spacesCountOne";
}

/** i18n key for the venue-page headline metric. */
export function metricLabelKey(
  type: VenueType
): "hallsMetric" | "spacesMetric" {
  return isHallVenue(type) ? "hallsMetric" : "spacesMetric";
}

/**
 * Whether the backfill may replace the stored type. A DEFAULT row is fair
 * game; an OPERATOR or SEED row is authoritative unless --force is passed.
 */
export function shouldUpdateVenueType(
  current: string,
  target: VenueType,
  source: string | null | undefined,
  force: boolean
): boolean {
  if (current === target) return false;
  if (force) return true;
  return (source ?? "DEFAULT") === "DEFAULT";
}
