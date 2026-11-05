import { z } from "zod";
import { db } from "@/lib/db";
import { listingWhere } from "@/lib/discovery/presentation";
import { EDITORIAL_LOCALES } from "@/lib/discovery/editorial";
import {
  MAX_ROW_TITLE,
  MAX_ROW_SUBTITLE,
  MAX_ROW_EVENTS,
  HOMEPAGE_REGIONS,
} from "./rows";

export const RowInputSchema = z.object({
  title: z.string().trim().min(1).max(MAX_ROW_TITLE),
  titleI18n: z
    .partialRecord(z.enum(EDITORIAL_LOCALES), z.string().max(MAX_ROW_TITLE))
    .optional(),
  subtitle: z.string().trim().max(MAX_ROW_SUBTITLE).nullable().optional(),
  subtitleI18n: z
    .partialRecord(z.enum(EDITORIAL_LOCALES), z.string().max(MAX_ROW_SUBTITLE))
    .optional(),
  regionId: z.enum(HOMEPAGE_REGIONS).nullable().optional(),
  eventIds: z.array(z.string().trim().min(1)).max(MAX_ROW_EVENTS),
  isActive: z.boolean().optional(),
});

export type RowInput = z.infer<typeof RowInputSchema>;

/** Every id must resolve to a public event that has not ended. */
export async function validateEventIds(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const rows = await db.event.findMany({
    where: {
      id: { in: ids },
      ...listingWhere(),
      endDate: { gte: new Date() },
    },
    select: { id: true },
  });
  return rows.length === ids.length;
}

export function nextPosition(rows: Array<{ position: number }>): number {
  return rows.reduce((max, row) => Math.max(max, row.position + 1), 0);
}

/** Rewrites positions to 0..n-1 for one scope, in current order. */
export async function renumberScope(regionId: string | null): Promise<void> {
  const rows = await db.homepageRow.findMany({
    where: { regionId },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  await db.$transaction(
    rows.map((row, index) =>
      db.homepageRow.update({
        where: { id: row.id },
        data: { position: index },
      })
    )
  );
}
