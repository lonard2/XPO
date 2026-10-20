export const DEFAULT_PAGE_SIZE = 200;
export const MAX_PAGE_SIZE = 500;

export interface Pagination {
  take: number;
  skip: number;
}

/**
 * Bounded pagination for list endpoints. Absent params yield the default
 * window; oversized takes clamp to the max; negatives and NaN fall back.
 */
export function parsePagination(search: URLSearchParams): Pagination {
  const rawTake = Number.parseInt(search.get("take") || "", 10);
  const rawSkip = Number.parseInt(search.get("skip") || "", 10);
  const take = Number.isInteger(rawTake) && rawTake > 0
    ? Math.min(rawTake, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const skip = Number.isInteger(rawSkip) && rawSkip >= 0 ? rawSkip : 0;
  return { take, skip };
}
