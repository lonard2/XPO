'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type VenueWithEvents } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface HeroVenueQuickGlanceRailProps {
  venues: VenueWithEvents[];
  locale: string;
  regionCode: string;
  className?: string;
}

export function HeroVenueQuickGlanceRail({
  venues,
  locale,
  regionCode,
  className,
}: HeroVenueQuickGlanceRailProps) {
  let tReg: any = (k: string) => k;
  let tTick: any = (k: string) => k;
  let tArch: any = (k: string) => k;
  let tVen: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tReg = useTranslations('regions');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tTick = useTranslations('tickets');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations('archetypes');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tVen = useTranslations('venues');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const timezone = getTimeZoneForRegion(regionCode);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  React.useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [venues]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!venues || venues.length === 0) {
    return null;
  }

  const regionNames: Record<string, string> = {
    id: 'Indonesia',
    jp: 'Japan',
    global: 'Global',
  };
  const regionLabel = regionNames[regionCode.toLowerCase()] || regionCode.toUpperCase();

  const getHeaderTitle = () => {
    let major = tVen('majorVenuesIn');
    if (!major || typeof major !== 'string' || major === 'majorVenuesIn' || major.includes('.')) {
      major = 'Major Venues in';
    }

    let regionTxt = regionLabel;
    try {
      const code = regionCode.toLowerCase();
      if (code === 'id' || code === 'jp' || code === 'global') {
        const localized = tReg(`${code}.name`);
        if (localized && typeof localized === 'string' && !localized.includes('.')) {
          regionTxt = localized;
        }
      }
    } catch {
      regionTxt = regionLabel;
    }

    let schedule = tVen('nearUpcomingSchedule');
    if (!schedule || typeof schedule !== 'string' || schedule === 'nearUpcomingSchedule' || schedule.includes('.')) {
      schedule = 'Near-Upcoming Schedule';
    }

    return `${major} ${regionTxt} — ${schedule}`;
  };

  const getQuickGlanceLabel = () => {
    const val = tVen('quickGlance');
    if (!val || typeof val !== 'string' || val === 'quickGlance' || val.includes('.')) return '(Quick Glance)';
    return val;
  };

  const getNoEventsLabel = () => {
    const val = tVen('noEventsScheduled');
    if (!val || typeof val !== 'string' || val === 'noEventsScheduled' || val.includes('.')) return 'No public events scheduled this week';
    return val;
  };

  const getViewVenueDetailLabel = () => {
    const val = tVen('viewVenueDetail');
    if (!val || typeof val !== 'string' || val === 'viewVenueDetail' || val.includes('.')) return 'View venue details & map';
    return val;
  };

  return (
    <div
      className={cn(
        'w-full border-t border-border/70 bg-card/95 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-col gap-2.5',
        className
      )}
    >
      {/* Top Header Rail */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold text-foreground tracking-tight">
            {getHeaderTitle()}
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {getQuickGlanceLabel()}
          </span>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            aria-label="Scroll venues left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            aria-label="Scroll venues right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontally Scrollable Rail */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3.5 overflow-x-auto pb-1 scrollbar-none snap-x"
      >
        {venues.map((venue) => {
          const upcomingEvents = (venue.events || []).slice(0, 3);
          const hallCount = venue.halls?.length || 0;

          return (
            <div
              key={venue.id}
              className="flex flex-col justify-between min-w-[300px] sm:min-w-[360px] max-w-[400px] rounded-xl border border-border/80 bg-background/80 hover:bg-background hover:border-primary/50 transition-all p-3 shadow-2xs snap-start shrink-0 space-y-2.5"
            >
              {/* Venue Title & Tag */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/${locale}/venues/${venue.slug}`}
                    className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors truncate block"
                    title={venue.name}
                  >
                    {venue.name}
                  </Link>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                    <span className="truncate">{venue.city}</span>
                  </span>
                </div>

                {hallCount > 0 && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                    {hallCount} Halls
                  </span>
                )}
              </div>

              {/* Up to 3 Upcoming Events */}
              <div className="space-y-1.5 flex-1">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((evt: VenueWithEvents['events'][number]) => {
                    const tokens = getArchetypeTokens(evt.archetype);
                    const dates = formatDateRange(evt.startDate, evt.endDate, locale, timezone);

                    let archTitle = tokens.displayName;
                    try {
                      if (tArch && typeof tArch.raw === 'function') {
                        const raw = tArch.raw(evt.archetype);
                        if (raw?.title) archTitle = raw.title;
                      }
                    } catch {
                      // fallback
                    }

                    return (
                      <Link
                        key={evt.id}
                        href={`/${locale}/events/${evt.slug}`}
                        className="group flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/60 p-2 hover:bg-accent/40 transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span
                              className="text-[9px] font-bold uppercase px-1 py-0.2 rounded whitespace-nowrap"
                              style={{
                                backgroundColor: `${tokens.primary}18`,
                                color: tokens.primary,
                              }}
                            >
                              {archTitle.split('&')[0].trim()}
                            </span>
                            {evt.venueHallName && (
                              <span className="text-[9px] font-medium text-foreground bg-muted px-1 py-0.2 rounded whitespace-nowrap">
                                {evt.venueHallName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {evt.title}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{dates}</span>
                          </div>
                        </div>

                        <div className="h-6 w-6 rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-2 text-center text-[11px] text-muted-foreground rounded-lg border border-dashed border-border/60">
                    <span>{getNoEventsLabel()}</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Link */}
              <div className="pt-1 border-t border-border/50 text-[10px]">
                <Link
                  href={`/${locale}/venues/${venue.slug}`}
                  className="text-primary hover:underline font-medium flex items-center justify-between"
                >
                  <span>{getViewVenueDetailLabel()}</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
