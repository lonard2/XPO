'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  MapPin,
  Building2,
  Ticket,
  Download,
  ArrowLeft,
  Layers,
  X,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens, type MiceArchetype } from '@/lib/theming';
import { type EventSummary } from '@/types/discovery';
import { downloadICalFile } from '@/lib/calendar/ical';
import { cn } from '@/lib/utils';

export interface CalendarInteractiveViewProps {
  initialEvents: EventSummary[];
  locale: string;
  region: string;
  initialArchetype?: string;
}

export function CalendarInteractiveView({
  initialEvents,
  locale,
  region,
  initialArchetype = 'all',
}: CalendarInteractiveViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tCal = useTranslations('calendar');
  const tCom = useTranslations('common');
  const tTix = useTranslations('tickets');
  const tReg = useTranslations('regions');
  const tArch = useTranslations('archetypes');

  const [selectedArchetype, setSelectedArchetype] = React.useState<string>(initialArchetype);
  const [selectedVenue, setSelectedVenue] = React.useState<string>('all');
  const [isExporting, setIsExporting] = React.useState(false);

  // Sync state if URL search params change externally
  React.useEffect(() => {
    const archParam = searchParams.get('archetype');
    if (archParam) {
      setSelectedArchetype(archParam);
    }
  }, [searchParams]);

  // Extract distinct venue names
  const availableVenues = React.useMemo(() => {
    const venues = new Set<string>();
    for (const evt of initialEvents) {
      if (evt.venueName) venues.add(evt.venueName);
    }
    return Array.from(venues);
  }, [initialEvents]);

  // Filter events based on active category & venue
  const filteredEvents = React.useMemo(() => {
    return initialEvents.filter((evt) => {
      const matchArchetype =
        !selectedArchetype ||
        selectedArchetype === 'all' ||
        evt.archetype === selectedArchetype;

      const matchVenue =
        !selectedVenue ||
        selectedVenue === 'all' ||
        (evt.venueName || '').toLowerCase() === selectedVenue.toLowerCase();

      return matchArchetype && matchVenue;
    });
  }, [initialEvents, selectedArchetype, selectedVenue]);

  // Handle in-place category selection
  const handleSelectCategory = (categoryId: string) => {
    setSelectedArchetype(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (!categoryId || categoryId === 'all') {
      params.delete('archetype');
    } else {
      params.set('archetype', categoryId);
    }
    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const handleResetFilters = () => {
    setSelectedArchetype('all');
    setSelectedVenue('all');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('archetype');
    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Group filtered events by Year-Month for chronological schedule chunking
  const eventsByMonth = React.useMemo(() => {
    const groups: { [key: string]: { monthTitle: string; events: EventSummary[] } } = {};
    const sorted = [...filteredEvents].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    for (const evt of sorted) {
      const d = new Date(evt.startDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const monthTitle = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

      if (!groups[key]) {
        groups[key] = { monthTitle, events: [] };
      }
      groups[key].events.push(evt);
    }

    return Object.values(groups);
  }, [filteredEvents, locale]);

  const timezone = getTimeZoneForRegion(region);

  const handleExportICal = () => {
    setIsExporting(true);
    const filename = `xpo-${region}-schedule.ics`;
    const calendarTitle = `XPO MICE ${region.toUpperCase()} Master Timetable`;
    downloadICalFile(filteredEvents, filename, calendarTitle);
    setTimeout(() => setIsExporting(false), 800);
  };

  const activeCategoryTokens =
    selectedArchetype && selectedArchetype !== 'all'
      ? getArchetypeTokens(selectedArchetype as MiceArchetype)
      : null;

  return (
    <div className="space-y-8">
      {/* Category Filter Pills (In-Place Filter) */}
      <div className="space-y-3">
        <EventCategoryPills
          locale={locale}
          activeCategoryId={selectedArchetype}
          onSelectCategory={handleSelectCategory}
        />

        {/* Active Filter Chips & Quick Reset */}
        {(selectedArchetype !== 'all' || selectedVenue !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">Active Filter:</span>

            {selectedArchetype !== 'all' && activeCategoryTokens && (
              <Badge
                variant="outline"
                className="gap-1.5 text-xs font-semibold py-1 px-2.5"
                style={{
                  color: activeCategoryTokens.primary,
                  borderColor: `${activeCategoryTokens.primary}55`,
                  backgroundColor: `${activeCategoryTokens.primary}10`,
                }}
              >
                <span>Category: {activeCategoryTokens.displayName}</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedVenue !== 'all' && (
              <Badge
                variant="outline"
                className="gap-1.5 text-xs font-semibold py-1 px-2.5 border-primary/40 bg-primary/10 text-primary"
              >
                <span>Venue: {selectedVenue}</span>
                <button
                  type="button"
                  onClick={() => setSelectedVenue('all')}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                  aria-label="Remove venue filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </Button>
          </div>
        )}
      </div>

      {/* Interactive Calendar Matrix & Day Timetable Widget */}
      <EventCalendarWidget
        events={filteredEvents}
        locale={locale}
        regionCode={region}
        isCalendarPage={true}
      />

      {/* Chronological Schedule Chunked by Month Milestones */}
      <div className="space-y-6 pt-6 border-t border-border/70">
        {/* Section Header & Export Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
              {tCal('monthView') || 'Chronological Schedule Overview'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filteredEvents.length} confirmed MICE trade exhibitions & keynotes in {region.toUpperCase()}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportICal}
              disabled={isExporting || filteredEvents.length === 0}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? 'Generating .ics...' : tCal('exportICal') || 'Export iCal (.ics)'}</span>
            </Button>
          </div>
        </div>

        {/* Venue Filter Bar */}
        {availableVenues.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>Venue:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedVenue('all')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer',
                selectedVenue === 'all'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              All Venues ({initialEvents.length})
            </button>

            {availableVenues.map((venueName) => {
              const count = initialEvents.filter((e) => e.venueName === venueName).length;
              const isSelected = selectedVenue.toLowerCase() === venueName.toLowerCase();

              return (
                <button
                  key={venueName}
                  type="button"
                  onClick={() => setSelectedVenue(venueName)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span>{venueName}</span>
                  <span className="ml-1.5 opacity-70 text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Monthly Chunked Event Groups */}
        {eventsByMonth.length > 0 ? (
          <div className="space-y-8">
            {eventsByMonth.map((monthGroup) => (
              <div key={monthGroup.monthTitle} className="space-y-4">
                {/* Sticky Milestone Header */}
                <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="text-sm sm:text-base font-bold text-foreground capitalize">
                      {monthGroup.monthTitle}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {monthGroup.events.length} Events
                  </Badge>
                </div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {monthGroup.events.map((evt) => {
                    const tokens = getArchetypeTokens(evt.archetype);
                    const dateRange = formatDateRange(evt.startDate, evt.endDate, locale, timezone);

                    let archetypeTitle = tokens.displayName;
                    try {
                      if (tArch && typeof (tArch as any).raw === 'function') {
                        const raw = (tArch as any).raw(evt.archetype);
                        if (raw?.title) archetypeTitle = raw.title;
                      }
                    } catch {
                      // fallback
                    }

                    return (
                      <div
                        key={evt.id}
                        className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 hover:border-primary/50 transition-all shadow-xs space-y-3"
                      >
                        <div className="space-y-2">
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
                              {archetypeTitle}
                            </Badge>
                            {evt.venueHallName && (
                              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {evt.venueHallName}
                              </span>
                            )}
                          </div>

                          <Link href={`/${locale}/events/${evt.slug}`}>
                            <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                              {evt.title}
                            </h4>
                          </Link>

                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                              <span className="truncate">
                                {evt.venueName} ({evt.cityName})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{dateRange}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/60">
                          <Link
                            href={`/${locale}/events/${evt.slug}`}
                            className={buttonVariants({
                              size: 'sm',
                              className: 'w-full gap-1.5 text-xs font-semibold cursor-pointer',
                            })}
                          >
                            <Ticket className="h-3.5 w-3.5" />
                            <span>{tTix('viewPass') || 'View Event & Tickets'}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/10">
            <h4 className="text-base font-bold text-foreground">No events found</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No confirmed trade shows match your active filters. Try selecting another category or resetting filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
