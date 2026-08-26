'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Ticket,
  ArrowRight,
  Layers,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type DiscoveryEvent } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface VenueScheduleTableProps {
  events: DiscoveryEvent[];
  locale: string;
  regionCode?: string;
  venueName: string;
  className?: string;
}

export function VenueScheduleTable({
  events,
  locale,
  regionCode = 'id',
  venueName,
  className,
}: VenueScheduleTableProps) {
  const timezone = getTimeZoneForRegion(regionCode);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <CalendarIcon className="h-4 w-4" />
            <span>Campus Schedule & Keynote Sessions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Scheduled Exhibitions at {venueName} ({events.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Confirmed trade shows, multi-track keynotes, and pavilion bookings.
          </p>
        </div>

        <Link
          href={`/${locale}/calendar`}
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5 text-xs font-semibold' })}
        >
          <span>Full Regional Calendar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-2 bg-muted/10">
          <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            No upcoming exhibitions currently scheduled
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Check back soon for new trade fair announcements and hall booking updates for {venueName}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => {
            const tokens = getArchetypeTokens(evt.archetype);
            const dates = formatDateRange(evt.startDate, evt.endDate, locale, timezone);
            const hallName = evt.venueHall?.name || (evt as any).venueHallName || 'Main Exhibition Hall';

            return (
              <div
                key={evt.id}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/50 transition-all shadow-xs space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase"
                      style={{
                        color: tokens.primary,
                        borderColor: `${tokens.primary}55`,
                        backgroundColor: `${tokens.primary}12`,
                      }}
                    >
                      {tokens.displayName}
                    </Badge>

                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {hallName}
                    </span>
                  </div>

                  <Link href={`/${locale}/events/${evt.slug}`}>
                    <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                  </Link>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{dates}</span>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <Link
                    href={`/${locale}/events/${evt.slug}`}
                    className={buttonVariants({
                      size: 'sm',
                      className: 'w-full gap-1.5 text-xs font-semibold cursor-pointer',
                    })}
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>View Event & Passes</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
