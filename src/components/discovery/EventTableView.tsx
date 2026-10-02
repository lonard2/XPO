'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { getArchetypeTokens } from '@/lib/theming';
import {
  formatDateRange,
  formatCurrency,
  getEventTemporalStatus,
  type SupportedCurrency,
} from '@/lib/i18n/formatters';
import { type DiscoveryEvent } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface EventTableViewProps {
  events: DiscoveryEvent[];
  locale: string;
  className?: string;
}

export const EventTableView = React.memo(function EventTableView({
  events,
  locale,
  className,
}: EventTableViewProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs', className)}>
      <table className="w-full text-left border-collapse text-xs min-w-[720px]">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase tracking-wider font-bold">
            <th scope="col" className="py-3.5 px-4 font-semibold">Exhibition & Vertical</th>
            <th scope="col" className="py-3.5 px-4 font-semibold">Spatial Hall & City</th>
            <th scope="col" className="py-3.5 px-4 font-semibold">Timeline & Dates</th>
            <th scope="col" className="py-3.5 px-4 font-semibold">Format & Scale</th>
            <th scope="col" className="py-3.5 px-4 font-semibold">Pass Entry</th>
            <th scope="col" className="py-3.5 px-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {events.map((event) => {
            const archetypeTokens = getArchetypeTokens(event.archetype);
            const temporal = getEventTemporalStatus(event.startDate, event.endDate);
            const formattedDates = formatDateRange(event.startDate, event.endDate, locale);

            // Compute lowest price tier
            let priceDisplay = 'Registration Open';
            if (event.ticketTiers && event.ticketTiers.length > 0) {
              const minPrice = Math.min(...event.ticketTiers.map((t) => t.price));
              const currency = (event.ticketTiers[0].currency || 'USD') as SupportedCurrency;
              if (minPrice === 0) {
                priceDisplay = 'Free Trade Pass';
              } else {
                priceDisplay = `From ${formatCurrency(minPrice, currency, locale)}`;
              }
            }

            return (
              <tr
                key={event.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                {/* 1. Exhibition Title & Archetype Badge */}
                <td className="py-3.5 px-4 max-w-[280px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: archetypeTokens.primary }}
                        aria-hidden="true"
                      />
                      <span
                        className="text-xs font-semibold tracking-wide"
                        style={{ color: archetypeTokens.primary }}
                      >
                        {archetypeTokens.displayName.split('&')[0].trim()}
                      </span>

                      {temporal.isLive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                          Live
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/${locale}/events/${event.slug}`}
                      className="font-bold text-foreground hover:text-primary transition-colors hover:underline line-clamp-2 block text-xs sm:text-sm"
                    >
                      {event.title}
                    </Link>

                    {event.tagline && (
                      <p className="text-muted-foreground line-clamp-1 text-[11px]">
                        {event.tagline}
                      </p>
                    )}
                  </div>
                </td>

                {/* 2. Venue, Hall & City */}
                <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                  <div className="space-y-0.5">
                    {event.venue && (
                      <Link
                        href={`/${locale}/venues/${event.venue.slug}`}
                        className="font-medium text-foreground hover:text-primary hover:underline transition-colors block"
                      >
                        {event.venue.name}
                      </Link>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{event.venue?.city || 'Main Venue'}</span>
                      {event.venueHall && (
                        <span className="text-foreground font-medium">
                          • {event.venueHall.name}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 3. Timeline & Dates */}
                <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                    <span className="font-medium text-foreground">{formattedDates}</span>
                  </div>
                </td>

                {/* 4. Format & Scale */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[11px] font-medium py-0 px-2">
                      {event.format.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {event.scale.replace(/_/g, ' ')}
                    </span>
                  </div>
                </td>

                {/* 5. Pass Pricing */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-foreground font-semibold">
                    <Ticket className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className={cn(priceDisplay === 'Free Trade Pass' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : '')}>
                      {priceDisplay}
                    </span>
                  </div>
                </td>

                {/* 6. Action Link */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Link
                    href={`/${locale}/events/${event.slug}`}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'gap-1 text-xs font-semibold hover:border-primary hover:text-primary transition-all min-h-[36px] cursor-pointer'
                    )}
                  >
                    <span>View Pass</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
