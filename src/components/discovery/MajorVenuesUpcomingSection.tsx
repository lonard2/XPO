'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDateRange, formatCurrency, getTimeZoneForRegion } from '@/lib/i18n/formatters';
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
            Happening at Major Venues
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Quick glance at active exhibitions and upcoming highlights across top convention centers.
          </p>
        </div>

        <Link href={`/${locale}/venues`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs self-start sm:self-auto">
            <span>View All {currentRegionName} Venues</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Major Venues Responsive Grid (Optimized for Mobile, Tablet & Widescreen Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
        {venues.map((venue) => {
          // Max 3 upcoming/current events per venue
          const upcomingEvents = (venue.events || []).slice(0, 3);
          const hallCount = venue.halls?.length || 0;

          return (
            <Card
              key={venue.id}
              className="flex flex-col justify-between overflow-hidden border-border/80 bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Venue Header Banner */}
              <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-900">
                {venue.imageUrl ? (
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="h-full w-full object-cover object-center opacity-70 hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-primary/30 via-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background/90 px-2.5 py-1 rounded-md backdrop-blur-sm shadow-xs border border-border/60">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="line-clamp-1">{venue.city}</span>
                  </div>

                  {hallCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-semibold bg-background/90 text-muted-foreground border-border/60">
                      {hallCount} Halls
                    </Badge>
                  )}
                </div>
              </div>

              {/* Venue Title & Transit Link */}
              <div className="p-4 sm:p-5 pb-2">
                <Link
                  href={`/${locale}/venues/${venue.slug}`}
                  className="group inline-block"
                >
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {venue.name}
                  </h3>
                </Link>
                {venue.transitInfo && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                    <span>{venue.transitInfo}</span>
                  </p>
                )}
              </div>

              {/* Up to 3 Current & Near-Upcoming Events */}
              <div className="p-4 sm:p-5 pt-0 space-y-2.5 flex-1 flex flex-col justify-start">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border/60 flex items-center justify-between">
                  <span>Current & Near-Upcoming Events</span>
                  <span className="text-[10px] font-normal lowercase text-primary font-mono">
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
                          className="rounded-lg border border-border/70 bg-background/60 p-2.5 hover:bg-accent/40 transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 uppercase font-semibold"
                                style={{ color: tokens.primary, borderColor: `${tokens.primary}44` }}
                              >
                                {tokens.displayName}
                              </Badge>

                              {evt.venueHallName && (
                                <span className="text-[10px] font-medium text-foreground bg-muted px-1.5 py-0.2 rounded">
                                  {evt.venueHallName}
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/${locale}/events/${evt.slug}`}
                              className="block text-xs font-semibold text-foreground hover:text-primary transition-colors truncate"
                              title={evt.title}
                            >
                              {evt.title}
                            </Link>

                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className="truncate">{dates}</span>
                            </div>
                          </div>

                          <Link href={`/${locale}/events/${evt.slug}`} className="shrink-0">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full hover:bg-primary hover:text-white transition-colors">
                              <ArrowRight className="h-3.5 w-3.5" />
                              <span className="sr-only">View Event</span>
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground my-auto">
                    <p>No active public events scheduled this week.</p>
                  </div>
                )}
              </div>

              {/* Venue Footer Link */}
              <div className="px-4 sm:px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                <Link
                  href={`/${locale}/venues/${venue.slug}`}
                  className="font-medium text-primary hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Explore full {venue.name} calendar</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
