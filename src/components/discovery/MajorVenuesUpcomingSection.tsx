'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  MapPin,
  ArrowRight,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type VenueWithEvents } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface MajorVenuesUpcomingProps {
  venues: VenueWithEvents[];
  locale: string;
  regionCode: string;
  className?: string;
}

export function MajorVenuesUpcomingSection({
  venues,
  locale,
  regionCode,
  className,
}: MajorVenuesUpcomingProps) {
  const tVen = useTranslations('venues');
  const tArch = useTranslations('archetypes');

  if (!venues || venues.length === 0) {
    return null;
  }

  const timezone = getTimeZoneForRegion(regionCode);

  const regionNameMap: Record<string, string> = {
    id: 'Indonesia',
    jp: 'Japan',
    global: 'Global Hubs',
  };

  const currentRegionName = regionNameMap[regionCode.toLowerCase()] || regionCode.toUpperCase();

  return (
    <section className={cn('w-full space-y-6', className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            <span>{currentRegionName} Edition Spotlight</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            {tVen('happeningAtVenue')?.split(' ')?.[0] === 'Happening' ? 'Happening at Major Venues' : (tVen('happeningAtVenue') || 'Happening at Major Venues')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {tVen('subtitle') || 'Quick glance at active exhibitions and upcoming highlights across top convention centers.'}
          </p>
        </div>

        <Link
          href={`/${locale}/venues`}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1.5 text-xs self-start sm:self-auto whitespace-nowrap min-h-[44px] sm:min-h-[36px] font-semibold'
          )}
        >
          <span>{tVen('title')?.split('&')?.[0]?.trim() || `View All ${currentRegionName} Venues`}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Major Venues Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {venues.map((venue) => {
          // Max 3 upcoming/current events per venue
          const upcomingEvents = (venue.events || []).slice(0, 3);
          const hallCount = venue.halls?.length || 0;

          return (
            <Card
              key={venue.id}
              className="flex flex-col justify-between overflow-hidden border-border/80 bg-card hover:border-primary/60 transition-all duration-300 shadow-xs hover:shadow-md"
            >
              {/* Venue Header Banner */}
              <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-950">
                {venue.imageUrl ? (
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="h-full w-full object-cover object-center opacity-75 hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-primary/30 via-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background/95 px-2.5 py-1 rounded-md backdrop-blur-md shadow-xs border border-border/70">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="line-clamp-1">{venue.city}</span>
                  </div>

                  {hallCount > 0 && (
                    <Badge variant="secondary" className="text-xs font-semibold bg-background/95 text-foreground border-border/70 tabular-nums backdrop-blur-md px-2.5 py-1 flex items-center gap-1">
                      <Layers className="h-3 w-3 text-primary shrink-0" />
                      <span>{hallCount} Halls</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Venue Title & Transit Link */}
              <div className="p-4 sm:p-5 pb-3">
                <Link
                  href={`/${locale}/venues/${venue.slug}`}
                  className="group inline-block"
                >
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {venue.name}
                  </h3>
                </Link>
                {venue.transitInfo && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{venue.transitInfo}</span>
                  </p>
                )}
              </div>

              {/* Up to 3 Current & Near-Upcoming Events */}
              <div className="p-4 sm:p-5 pt-0 space-y-2.5 flex-1 flex flex-col justify-start">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-3 border-t border-border/70 flex items-center justify-between">
                  <span>Current & Near-Upcoming Events</span>
                  <span className="text-xs font-semibold text-primary font-mono tabular-nums">
                    {upcomingEvents.length} listed
                  </span>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingEvents.map((evt: VenueWithEvents['events'][number]) => {
                      const tokens = getArchetypeTokens(evt.archetype);
                      const dates = formatDateRange(evt.startDate, evt.endDate, locale, timezone);

                      return (
                        <div
                          key={evt.id}
                          className="group/evt relative rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 p-3 hover:border-primary/40 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-[11px] px-2 py-0.5 uppercase font-bold tracking-wide"
                                style={{
                                  color: tokens.primary,
                                  borderColor: `${tokens.primary}44`,
                                  backgroundColor: `${tokens.primary}12`,
                                }}
                              >
                                {tokens.displayName}
                              </Badge>

                              {evt.venueHallName && (
                                <span className="text-[11px] font-semibold text-foreground/90 bg-muted/80 px-2 py-0.5 rounded-md border border-border/60">
                                  {evt.venueHallName}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/${locale}/events/${evt.slug}`}
                              className="block text-xs sm:text-sm font-bold text-foreground group-hover/evt:text-primary transition-colors truncate after:absolute after:inset-0 focus-visible:outline-none"
                              title={evt.title}
                            >
                              {evt.title}
                            </Link>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                              <span className="truncate tabular-nums font-medium">{dates}</span>
                            </div>
                          </div>

                          <div
                            aria-hidden="true"
                            className="h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-full bg-background/50 group-hover/evt:bg-primary group-hover/evt:text-primary-foreground transition-colors min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center shrink-0 border border-border/40 group-hover/evt:border-primary pointer-events-none"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground my-auto flex flex-col items-center justify-center gap-1.5 bg-muted/10">
                    <Calendar className="h-4 w-4 text-muted-foreground/60" />
                    <p className="font-medium text-foreground/80">No active public exhibitions scheduled this week</p>
                    <p className="text-[11px] text-muted-foreground">Check upcoming season dates in the venue directory</p>
                  </div>
                )}
              </div>

              {/* Venue Footer Link */}
              <div className="px-4 sm:px-5 py-3 border-t border-border/70 bg-muted/30 flex items-center justify-between text-xs">
                <Link
                  href={`/${locale}/venues/${venue.slug}`}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-xs group/link"
                >
                  <span>Explore full {venue.name} calendar</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
