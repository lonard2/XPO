import { getEventTemporalStatus } from '@/lib/i18n/formatters';

export interface OrderableEvent {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Orders events so the ones a delegate can still attend come first: live and upcoming
 * events soonest-first, then concluded events most-recently-concluded-first.
 *
 * The homepage previously relied on `orderBy: { startDate: 'asc' }`, which put the oldest
 * events first and opened the hero on a finished fair. Ordering is stable, so events that
 * compare equal keep their incoming order.
 */
export function sortUpcomingFirst<T extends OrderableEvent>(
  events: readonly T[],
  now: Date = new Date()
): T[] {
  return events
    .map((event, index) => {
      const temporal = getEventTemporalStatus(event.startDate, event.endDate, now);
      const attendable = temporal.isUpcoming || temporal.isLive;
      const start = new Date(event.startDate).getTime();
      const startTime = Number.isNaN(start) ? 0 : start;

      return {
        event,
        index,
        attendable,
        // Soonest first while attendable; most recently concluded first once past.
        // An unparseable date lands last either way.
        order: attendable ? startTime : -startTime,
      };
    })
    .sort((a, b) => {
      if (a.attendable !== b.attendable) return a.attendable ? -1 : 1;
      if (a.order !== b.order) return a.order - b.order;
      return a.index - b.index;
    })
    .map((entry) => entry.event);
}
