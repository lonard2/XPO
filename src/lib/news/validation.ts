import { z } from "zod";

/**
 * Editorial caps for event news. Bodies stay short on purpose: updates are
 * timeline entries, not articles. Lengths are UTF-16 units, matching the
 * repo's Zod `.max` convention elsewhere.
 */
export const UPDATE_TITLE_MAX = 120;
export const UPDATE_BODY_MAX = 500;
export const NEWS_SLOTS_MAX = 6;

export const NEWS_REGIONS = ["id", "jp", "global"] as const;

export const EventUpdateInput = z.object({
  title: z.string().trim().min(1).max(UPDATE_TITLE_MAX),
  body: z.string().trim().min(1).max(UPDATE_BODY_MAX),
});

export const NewsSlotInput = z.object({
  updateId: z.string().trim().min(1),
  regionId: z.enum(NEWS_REGIONS),
  position: z.number().int().min(0),
});

/** Deep-link anchor for a timeline entry: `#update-<cuid>`. */
export function updateAnchor(id: string): string {
  return `#update-${id}`;
}
