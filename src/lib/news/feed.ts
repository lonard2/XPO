/**
 * News feed predicates.
 *
 * Public surfaces render approved copy only, and the homepage rail also
 * requires an event a delegate can still attend. Keeping the predicates
 * here makes them testable at the layer that enforces them, instead of
 * trusting components to receive pre-filtered props.
 */

export interface RailSlotRow {
  updateId: string;
  position: number;
  update: {
    id: string;
    title: string;
    body: string;
    status: string;
    event: {
      slug: string;
      title: string;
      endDate: Date | string;
    } | null;
  } | null;
}

export interface RailItem {
  updateId: string;
  title: string;
  body: string;
  eventSlug: string;
  eventTitle: string;
}

export function selectRailItems(
  slots: RailSlotRow[],
  now: Date
): RailItem[] {
  const items: RailItem[] = [];
  for (const slot of slots) {
    const update = slot.update;
    if (!update || update.status !== "APPROVED" || !update.event) continue;
    if (new Date(update.event.endDate) < now) continue;
    items.push({
      updateId: update.id,
      title: update.title,
      body: update.body,
      eventSlug: update.event.slug,
      eventTitle: update.event.title,
    });
  }
  return items;
}

export interface TimelineRow {
  id: string;
  title: string;
  body: string;
  status: string;
  approvedAt: Date | string | null;
}

export interface TimelineItem {
  id: string;
  title: string;
  body: string;
  approvedAt: string | null;
}

export function selectTimelineItems(rows: TimelineRow[]): TimelineItem[] {
  return rows
    .filter((row) => row.status === "APPROVED")
    .map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      approvedAt: row.approvedAt
        ? new Date(row.approvedAt).toISOString()
        : null,
    }));
}
