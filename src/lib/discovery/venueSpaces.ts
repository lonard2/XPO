import type { VenueHallSummary } from '@/types/discovery';

export const MEETING_ROOM_KIND = 'MEETING_ROOM';

/** Meeting rooms are inventoried on venues but listed deeper, never counted as halls. */
export function isMeetingRoom(hall: Pick<VenueHallSummary, 'kind'>): boolean {
  return (hall.kind || '').toUpperCase() === MEETING_ROOM_KIND;
}

/** Halls and sub-venues only: exhibition halls, ballrooms, theatres, arenas, outdoor spaces. */
export function hallsOnly<T extends Pick<VenueHallSummary, 'kind'>>(halls: readonly T[]): T[] {
  return halls.filter((hall) => !isMeetingRoom(hall));
}

/** Meeting rooms only, for the deeper listing on the venue page. */
export function meetingRoomsOnly<T extends Pick<VenueHallSummary, 'kind'>>(halls: readonly T[]): T[] {
  return halls.filter(isMeetingRoom);
}

/** The "N Halls" figure: halls and sub-venues, never meeting rooms. */
export function countHalls(halls: readonly Pick<VenueHallSummary, 'kind'>[] | undefined | null): number {
  return halls ? hallsOnly(halls).length : 0;
}
