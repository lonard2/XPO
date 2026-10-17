'use client';

import * as React from 'react';
import { Building2, ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type VenueHallSummary } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface VenueMeetingRoomsProps {
  rooms: VenueHallSummary[];
  title: string;
  className?: string;
}

const INITIAL_ROOM_COUNT = 12;

/**
 * Meeting rooms live one level deeper than halls: collapsed behind a filter toggle,
 * never counted in any "N Halls" figure. Starts collapsed so the venue page leads
 * with halls and sub-venues. The grid caps at an initial dozen rows with a
 * progressive reveal, and a text filter narrows it further.
 */
export function VenueMeetingRooms({ rooms, title, className }: VenueMeetingRoomsProps) {
  const tVen = useTranslations('venues');
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        (room.description || '').toLowerCase().includes(q)
    );
  }, [rooms, query]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_ROOM_COUNT);

  if (rooms.length === 0) {
    return null;
  }

  return (
    <section className={cn('container px-4 space-y-4', className)}>
      <div className="border-b border-border/80 pb-4">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="venue-meeting-rooms-grid"
          className="w-full flex items-center justify-between gap-3 text-left rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Building2 className="h-4 w-4" />
              <span>{title}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {title} ({rooms.length})
            </h2>
          </div>
          <span
            className={cn(
              'flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/70 text-muted-foreground shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowAll(false);
              }}
              placeholder={tVen('meetingRoomsSearch')}
              aria-label={tVen('meetingRoomsSearch')}
              autoComplete="off"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/80 bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {tVen('meetingRoomsNoMatch')}
            </p>
          ) : (
            <div
              id="venue-meeting-rooms-grid"
              role="region"
              aria-label={`${title} (${rooms.length})`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {visible.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-border/70 bg-card/60 p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-foreground leading-snug">{room.name}</p>
                    {room.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                        {room.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-xs">
                    {room.capacity != null && (
                      <span className="font-mono font-semibold text-foreground tabular-nums">
                        {room.capacity.toLocaleString()} pax
                      </span>
                    )}
                    {room.floorAreaSqm != null && (
                      <span className="text-muted-foreground tabular-nums">
                        {room.floorAreaSqm.toLocaleString()} m²
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > INITIAL_ROOM_COUNT && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className="min-h-[44px] px-4 text-xs font-semibold text-primary hover:underline cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showAll ? tVen('meetingRoomsShowLess') : tVen('meetingRoomsShowAll', { count: filtered.length })}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
