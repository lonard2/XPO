'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
} from 'lucide-react';
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
  const tReg = useTranslations('regions');
  const tTick = useTranslations('tickets');
  const tArch = useTranslations('archetypes');
  const tVen = useTranslations('venues');

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Mouse Drag-to-Scroll State
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);

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
      el.addEventListener('scroll', checkScroll, { passive: true });
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
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
    const major = tVen('majorVenuesIn') || 'Major Venues in';
    let regionTxt = regionLabel;
    try {
      if (tReg && typeof tReg.raw === 'function') {
        const regObj = tReg.raw(regionCode.toLowerCase());
        if (regObj?.name) regionTxt = regObj.name;
      }
    } catch {
      // fallback
    }
    return `${major} ${regionTxt}`;
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
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            {getHeaderTitle()}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {tVen('quickGlanceSchedule')}
          </span>
        </div>

        {/* Scroll Arrows with 44px Touch Target Support */}
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            aria-label="Scroll venues left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            aria-label="Scroll venues right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontally Scrollable Rail with Drag Support */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          'flex items-stretch gap-3.5 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-y',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        {venues.map((venue) => {
          const upcomingEvents = (venue.events || []).slice(0, 3);
          const hallCount = venue.halls?.length || 0;

          return (
            <div
              key={venue.id}
              className="flex flex-col justify-between min-w-[300px] sm:min-w-[360px] max-w-[400px] rounded-xl border border-border/80 bg-background/80 hover:bg-background hover:border-primary/50 transition-all p-3.5 shadow-2xs snap-start shrink-0 space-y-2.5"
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
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                    <span className="truncate">{venue.city}</span>
                  </span>
                </div>

                {hallCount > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
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
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-xs font-bold uppercase px-1.5 py-0.5 rounded whitespace-nowrap"
                              style={{
                                backgroundColor: `${tokens.primary}18`,
                                color: tokens.primary,
                              }}
                            >
                              {archTitle.split('&')[0].trim()}
                            </span>
                            {evt.venueHallName && (
                              <span className="text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                                {evt.venueHallName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {evt.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="truncate">{dates}</span>
                          </div>
                        </div>

                        <div className="h-6 w-6 rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-2 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border/60">
                    <span>{tVen('noUpcomingEventsScheduled')}</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Link */}
              <div className="pt-1.5 border-t border-border/50 text-xs">
                <Link
                  href={`/${locale}/venues/${venue.slug}`}
                  className="text-primary hover:underline font-medium flex items-center justify-between"
                >
                  <span>{tVen('viewVenueDetailMap')}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
