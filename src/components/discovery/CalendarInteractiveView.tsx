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
  ChevronDown,
  ExternalLink,
  FileSpreadsheet,
  Copy,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens, type MiceArchetype } from '@/lib/theming';
import { archTitle } from '@/lib/i18n/categories';
import { type EventSummary } from '@/types/discovery';
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
  generateOutlookWebUrl,
  downloadCsvSchedule,
  generatePlainTextSchedule,
} from '@/lib/calendar/ical';
import { cn } from '@/lib/utils';

export interface CalendarInteractiveViewProps {
  initialEvents: EventSummary[];
  locale: string;
  region: string;
  initialArchetype?: string;
  initialVenue?: string;
}

export function CalendarInteractiveView({
  initialEvents,
  locale,
  region,
  initialArchetype = 'all',
  initialVenue = 'all',
}: CalendarInteractiveViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tCal = useTranslations('calendar');
  const tCom = useTranslations('common');
  const tTix = useTranslations('tickets');
  const tReg = useTranslations('regions');
  const tArch = useTranslations('archetypes');
  const tEvents = useTranslations('events');

  const [selectedArchetype, setSelectedArchetype] = React.useState<string>(initialArchetype);
  const [selectedVenue, setSelectedVenue] = React.useState<string>(initialVenue);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  // The 22-tile vertical explorer collapses behind a disclosure so the
  // timetable stays the workspace lead; it opens when a category is active.
  const [filtersExpanded, setFiltersExpanded] = React.useState(initialArchetype !== 'all');
  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  const exportTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Arrow-key navigation across export menu items (menu pattern).
  const handleExportMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = Array.from(
      exportMenuRef.current?.querySelectorAll('[role="menuitem"]') || []
    ) as HTMLElement[];
    if (items.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    let idx = active ? items.indexOf(active) : -1;
    if (e.key === 'ArrowDown') idx = (idx + 1) % items.length;
    else if (e.key === 'ArrowUp') idx = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') idx = 0;
    else idx = items.length - 1;
    items[idx]?.focus();
  };

  // Sync state if URL search params change externally (archetype + venue shareable)
  React.useEffect(() => {
    const archParam = searchParams.get('archetype');
    if (archParam) {
      setSelectedArchetype(archParam);
    }
    const venueParam = searchParams.get('venue');
    if (venueParam) {
      setSelectedVenue(venueParam);
    }
  }, [searchParams]);

  // Handle escape and click outside for export dropdown
  React.useEffect(() => {
    if (!exportOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExportOpen(false);
        exportTriggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [exportOpen]);

  // Extract distinct venue names
  const availableVenues = React.useMemo(() => {
    const venues = new Set<string>();
    for (const evt of initialEvents) {
      if (evt.venueName) venues.add(evt.venueName);
    }
    return Array.from(venues);
  }, [initialEvents]);

  // Events matching the category filter only: the basis for venue pill counts so
  // counts never promise more than the active category can deliver.
  const archetypeFilteredEvents = React.useMemo(() => {
    return initialEvents.filter((evt) => {
      return (
        !selectedArchetype ||
        selectedArchetype === 'all' ||
        evt.archetype === selectedArchetype
      );
    });
  }, [initialEvents, selectedArchetype]);

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

  const handleSelectVenue = (venueName: string) => {
    setSelectedVenue(venueName);
    setExportError(null);
    const params = new URLSearchParams(searchParams.toString());
    if (!venueName || venueName === 'all') {
      params.delete('venue');
    } else {
      params.set('venue', venueName);
    }
    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const handleResetFilters = () => {
    setSelectedArchetype('all');
    setSelectedVenue('all');
    setExportError(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('archetype');
    params.delete('venue');
    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Group filtered events by Year-Month for chronological schedule chunking
  const eventsByMonth = React.useMemo(() => {
    const groups: { [key: string]: { key: string; monthTitle: string; events: EventSummary[] } } = {};
    const sorted = [...filteredEvents].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    for (const evt of sorted) {
      const d = new Date(evt.startDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const monthTitle = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

      if (!groups[key]) {
        groups[key] = { key, monthTitle, events: [] };
      }
      groups[key].events.push(evt);
    }

    return Object.values(groups);
  }, [filteredEvents, locale]);

  const timezone = getTimeZoneForRegion(region);

  const nextUpcomingEvent = React.useMemo(() => {
    if (filteredEvents.length === 0) return null;
    const now = new Date().getTime();
    const sorted = [...filteredEvents].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    return sorted.find((e) => new Date(e.endDate).getTime() >= now) || sorted[0];
  }, [filteredEvents]);

  // Export handlers: surface failures inline instead of closing silently. The
  // single-event links need a real site origin for the details URL, never the
  // region timezone (a past bug produced Asia/Jakarta/events/slug dead links).
  const eventDetailsOrigin =
    typeof window !== 'undefined' ? `${window.location.origin}/${locale}` : `https://xpo-mice.com/${locale}`;

  const handleExportICal = () => {
    setIsExporting(true);
    setExportError(null);
    const filename = `xpo-${region}-schedule.ics`;
    const calendarTitle = `XPO MICE ${region.toUpperCase()} Master Timetable`;
    const ok = downloadICalFile(filteredEvents, filename, calendarTitle);
    if (!ok) {
      setIsExporting(false);
      setExportError(tCal('exportFailed') || 'Export failed. No events to export or your browser blocked the download.');
      return;
    }
    setTimeout(() => {
      setIsExporting(false);
      setExportOpen(false);
    }, 600);
  };

  const handleExportCsv = () => {
    setExportError(null);
    const filename = `xpo-${region}-schedule.csv`;
    const ok = downloadCsvSchedule(filteredEvents, filename);
    if (!ok) {
      setExportError(tCal('exportFailed') || 'Export failed. No events to export or your browser blocked the download.');
      return;
    }
    setExportOpen(false);
  };

  const handleCopyPlainText = async () => {
    try {
      setExportError(null);
      const text = generatePlainTextSchedule(filteredEvents, locale);
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => {
        setCopiedText(false);
        setExportOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy itinerary to clipboard:', err);
      setExportError(tCal('copyFailed') || 'Copy failed. Your browser blocked clipboard access.');
    }
  };

  // Synchronize calendar widget date selection to scroll to month milestone
  const handleWidgetDateSelect = (date: Date) => {
    const monthKey = `month-${date.getFullYear()}-${date.getMonth() + 1}`;
    const el = document.getElementById(monthKey);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeCategoryTokens =
    selectedArchetype && selectedArchetype !== 'all'
      ? getArchetypeTokens(selectedArchetype as MiceArchetype)
      : null;

  return (
    <div className="space-y-8">
      {/* 1. Interactive Calendar Matrix & Day Timetable Widget (Workspace Lead) */}
      <EventCalendarWidget
        events={filteredEvents}
        locale={locale}
        regionCode={region}
        isCalendarPage={true}
        onSelectDate={handleWidgetDateSelect}
      />

      {/* 2. Taxonomy & Filter Controls */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {tArch('browseByCategory') || 'Filter Exhibitions by Industry Vertical'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {tCal('filterIntro') || 'Select a specialized MICE category to narrow your calendar view.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-muted-foreground" aria-live="polite">
              {tCal('resultSummary', { shown: filteredEvents.length, total: initialEvents.length }) || `Showing ${filteredEvents.length} of ${initialEvents.length}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              aria-expanded={filtersExpanded}
              className="gap-1.5 text-xs font-semibold cursor-pointer min-h-[44px] sm:min-h-[36px]"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{filtersExpanded ? (tCal('hideVerticals') || 'Hide verticals') : (tCal('browseVerticals') || 'Browse all verticals')}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', filtersExpanded && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {filtersExpanded && (
          <EventCategoryPills
            locale={locale}
            activeCategoryId={selectedArchetype}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {/* Active Filter Chips & Quick Reset */}
        {(selectedArchetype !== 'all' || selectedVenue !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">
              {tCal('activeFilter') || 'Active Filter:'}
            </span>

            {selectedArchetype !== 'all' && activeCategoryTokens && (
              <Badge
                variant="outline"
                className="gap-1.5 text-xs font-semibold py-1 px-2.5 pr-1.5"
                style={{
                  color: activeCategoryTokens.primary,
                  borderColor: `${activeCategoryTokens.primary}55`,
                  backgroundColor: `${activeCategoryTokens.primary}10`,
                }}
              >
                <span>{tCom('category') || 'Category'}: {archTitle(tArch, selectedArchetype as string, activeCategoryTokens.displayName)}</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full hover:bg-foreground/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={tCal('removeCategoryFilter') || 'Remove category filter'}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedVenue !== 'all' && (
              <Badge
                variant="outline"
                className="gap-1.5 text-xs font-semibold py-1 px-2.5 pr-1.5 border-primary/40 bg-primary/10 text-primary"
              >
                <span>{tCal('filterVenue') || 'Venue:'} {selectedVenue}</span>
                <button
                  type="button"
                  onClick={() => handleSelectVenue('all')}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full hover:bg-foreground/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={tCal('removeVenueFilter') || 'Remove venue filter'}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{tCal('resetFilters') || tCom('clear') || 'Reset Filters'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* 3. Chronological Schedule Chunked by Month Milestones */}
      <div className="space-y-6 pt-6 border-t border-border/80">
        {/* Section Header & Export Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
              {tCal('monthView') || 'Chronological Schedule Overview'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {tCal('confirmedScheduleDesc', { count: filteredEvents.length, region: region.toUpperCase() }) || `${filteredEvents.length} confirmed MICE trade exhibitions & keynotes in ${region.toUpperCase()}.`}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tCal('exportTimezoneNote') || 'All dates shown in'} {timezone}
            </p>
          </div>

          {/* Multi-Format Export Suite */}
          <div className="relative flex items-center gap-1.5" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportICal}
              disabled={isExporting || filteredEvents.length === 0}
              className="gap-1.5 text-xs font-semibold cursor-pointer min-h-[44px] sm:min-h-[36px]"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>{isExporting ? (tCal('generating') || 'Generating .ics...') : `${tCal('exportICal') || 'Export iCal (.ics)'} · ${filteredEvents.length}`}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(!exportOpen)}
              disabled={filteredEvents.length === 0}
              className="px-2 text-xs font-semibold cursor-pointer min-h-[44px] sm:min-h-[36px]"
              aria-label={tCal('moreExportFormats') || 'More export formats'}
              aria-haspopup="true"
              aria-expanded={exportOpen}
              aria-controls="calendar-export-menu"
              ref={exportTriggerRef}
            >
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', exportOpen && 'rotate-180')} />
            </Button>

            {exportOpen && (
              <div
                id="calendar-export-menu"
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1.5 shadow-lg z-30 space-y-1 animate-in fade-in-50 zoom-in-95"
                role="menu"
                aria-orientation="vertical"
                onKeyDown={handleExportMenuKeyDown}
              >
                {/* Group 1: whole filtered set */}
                <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tCal('exportBulkGroup') || 'Full filtered set'} ({filteredEvents.length})
                </p>
                {/* Option 1: .ics download */}
                <button
                  type="button"
                  onClick={handleExportICal}
                  disabled={isExporting}
                  role="menuitem"
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-muted/80 transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary mt-0.5 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground">
                      {isExporting ? (tCal('generatingICal') || 'Generating iCalendar...') : (tCal('icalFile') || 'iCalendar File (.ics)')}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {(tCal('icalApps') || 'Apple Calendar, Outlook, Thunderbird')} · {filteredEvents.length} events
                    </p>
                  </div>
                </button>

                {/* Group 2: one event only */}
                {nextUpcomingEvent && (
                  <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {tCal('exportSingleGroup') || 'Single event'}
                  </p>
                )}

                {/* Option 2: Google Calendar */}
                {nextUpcomingEvent && (
                  <a
                    href={generateGoogleCalendarUrl(nextUpcomingEvent, eventDetailsOrigin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setExportOpen(false)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-muted/80 transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span>{tCal('googleCalendar') || 'Google Calendar'}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {tCal('addNext', { title: nextUpcomingEvent.title }) || `Add next: ${nextUpcomingEvent.title}`}
                      </p>
                    </div>
                  </a>
                )}

                {/* Option 3: Outlook 365 Web */}
                {nextUpcomingEvent && (
                  <a
                    href={generateOutlookWebUrl(nextUpcomingEvent, eventDetailsOrigin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setExportOpen(false)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-muted/80 transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span>{tCal('outlookWeb') || 'Outlook 365 Web'}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {tCal('addNext', { title: nextUpcomingEvent.title }) || `Add next: ${nextUpcomingEvent.title}`}
                      </p>
                    </div>
                  </a>
                )}

                {/* Option 4: CSV Spreadsheet */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  role="menuitem"
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-muted/80 transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 mt-0.5 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground">
                      {tCal('csvFile') || 'CSV Spreadsheet (.csv)'}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {(tCal('csvDesc') || 'RFC 4180 format for Excel and Sheets')} · {filteredEvents.length} events
                    </p>
                  </div>
                </button>

                {/* Option 5: Copy plain text itinerary */}
                <button
                  type="button"
                  onClick={handleCopyPlainText}
                  role="menuitem"
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-muted/80 transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-muted text-foreground mt-0.5 shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                    {copiedText ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground">
                      {copiedText ? (tCal('copiedTitle') || 'Schedule Copied!') : (tCal('copyTitle') || 'Copy Text Summary')}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {copiedText ? (tCal('copiedDesc') || 'Ready to paste into chat or docs') : `${tCal('copyDesc') || 'Plain-text agenda'} · ${filteredEvents.length} events`}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
          {exportError && (
            <p role="alert" className="text-xs font-medium text-destructive pt-1">
              {exportError}
            </p>
          )}
        </div>

        {/* Venue Filter Bar */}
        {availableVenues.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>{tCal('filterVenue') || 'Venue:'}</span>
            </span>

            <button
              type="button"
              onClick={() => handleSelectVenue('all')}
              className={cn(
                'min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                selectedVenue === 'all'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{tCal('allVenues') || 'All Venues'}</span>
              <span className="opacity-80 text-xs font-mono">({archetypeFilteredEvents.length})</span>
            </button>

            {availableVenues.map((venueName) => {
              const count = archetypeFilteredEvents.filter((e) => e.venueName === venueName).length;
              const isSelected = selectedVenue.toLowerCase() === venueName.toLowerCase();

              return (
                <button
                  key={venueName}
                  type="button"
                  onClick={() => handleSelectVenue(venueName)}
                  className={cn(
                    'min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span>{venueName}</span>
                  <span className="opacity-80 text-xs font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Monthly Chunked Event Groups */}
        {eventsByMonth.length > 0 ? (
          <div className="space-y-8">
            {eventsByMonth.map((monthGroup) => (
              <div
                key={monthGroup.key}
                id={`month-${monthGroup.key}`}
                className="space-y-4 scroll-mt-24"
              >
                {/* Sticky Milestone Header */}
                <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="text-sm sm:text-base font-bold text-foreground capitalize">
                      {monthGroup.monthTitle}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {monthGroup.events.length} {tEvents('title')?.split('&')?.[0]?.trim() || 'Events'}
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
                        className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 hover:border-primary/50 transition-all shadow-xs space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold uppercase"
                              style={{
                                color: tokens.primary,
                                borderColor: `${tokens.primary}55`,
                                backgroundColor: `${tokens.primary}12`,
                              }}
                            >
                              {archetypeTitle}
                            </Badge>
                            {evt.venueHallName && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {evt.venueHallName}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                            <Link
                              href={`/${locale}/events/${evt.slug}`}
                              className="after:absolute after:inset-0"
                            >
                              {evt.title}
                            </Link>
                          </h4>

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
                              className: 'relative z-10 w-full gap-1.5 text-xs font-semibold min-h-[44px] sm:min-h-[36px] cursor-pointer',
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
            <h4 className="text-base font-bold text-foreground">
              {tCal('noEventsFound') || 'No events found'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {tCal('noEventsFoundDesc') || 'No confirmed trade shows match your active filters. Try selecting another category or resetting filters.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="gap-1.5 text-xs font-semibold cursor-pointer min-h-[44px] sm:min-h-[36px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tCal('resetAllFilters') || 'Reset All Filters'}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
