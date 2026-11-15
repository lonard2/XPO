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
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  Copy,
  CalendarPlus,
  Mail,
  Clock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';
import {
  formatDate,
  formatDateRange,
  formatTime,
  getEventTemporalStatus,
  getTimeZoneForRegion,
} from '@/lib/i18n/formatters';
import { getArchetypeTokens, getReadableArchetypeLabel, type MiceArchetype } from '@/lib/theming';
import { archTitle } from '@/lib/i18n/categories';
import { type EventSummary } from '@/types/discovery';
import { type ScheduleStub, isScheduleStub } from '@/lib/discovery/presentation';
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
  generateOutlookWebUrl,
  downloadCsvSchedule,
  generatePlainTextSchedule,
} from '@/lib/calendar/ical';
import { cn } from '@/lib/utils';

export interface CalendarInteractiveViewProps {
  initialEvents: Array<EventSummary | ScheduleStub>;
  locale: string;
  region: string;
  initialArchetype?: string;
  initialVenue?: string;
  /** Server-resolved site origin for calendar and event links. */
  eventDetailsOrigin?: string;
}

type CalendarMonthGroup = {
  key: string;
  monthTitle: string;
  events: Array<EventSummary | ScheduleStub>;
};

export function CalendarInteractiveView({
  initialEvents,
  locale,
  region,
  initialArchetype = 'all',
  initialVenue = 'all',
  eventDetailsOrigin = 'https://xpo-mice.com',
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
  const [pastExpanded, setPastExpanded] = React.useState(false);
  const [expandedSessions, setExpandedSessions] = React.useState<Set<string>>(new Set());
  const [includeConcludedInExport, setIncludeConcludedInExport] = React.useState(false);
  const [exportMenuUp, setExportMenuUp] = React.useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  const exportTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Arrow-key navigation across export menu items (menu pattern).
  const handleExportMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = Array.from(
      exportMenuRef.current?.querySelectorAll(
        '[role="menuitem"], [role="menuitemcheckbox"]'
      ) || []
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
      if (!isScheduleStub(evt) && evt.venueName) venues.add(evt.venueName);
    }
    return Array.from(venues);
  }, [initialEvents]);

  // Events matching the category filter only: the basis for venue pill counts so
  // counts never promise more than the active category can deliver.
  const archetypeFilteredEvents = React.useMemo(() => {
    return initialEvents.filter((evt) => {
      if (isScheduleStub(evt)) return !selectedArchetype || selectedArchetype === 'all';
      return (
        !selectedArchetype ||
        selectedArchetype === 'all' ||
        evt.archetype === selectedArchetype
      );
    });
  }, [initialEvents, selectedArchetype]);

  // Filter events based on active category & venue. Stubs carry no
  // archetype or venue to match on: they show under open filters and drop
  // out as soon as the visitor narrows, rather than misattributing.
  const filteredEvents = React.useMemo(() => {
    return initialEvents.filter((evt) => {
      if (isScheduleStub(evt)) {
        const narrowed =
          (selectedArchetype && selectedArchetype !== 'all') ||
          (selectedVenue && selectedVenue !== 'all');
        return !narrowed;
      }
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

  const toggleSessions = (id: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    const groups: { [key: string]: CalendarMonthGroup } = {};
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

  // Current and future months lead; concluded months are available behind one
  // disclosure instead of being the page's default reading order.
  const currentMonthGroups = React.useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return eventsByMonth.filter((group) => {
      const [year, month] = group.key.split('-').map(Number);
      return new Date(year, month - 1, 1).getTime() >= currentMonthStart;
    });
  }, [eventsByMonth]);

  const pastMonthGroups = React.useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return eventsByMonth.filter((group) => {
      const [year, month] = group.key.split('-').map(Number);
      return new Date(year, month - 1, 1).getTime() < currentMonthStart;
    });
  }, [eventsByMonth]);

  const pastEventCount = React.useMemo(
    () => pastMonthGroups.reduce((sum, group) => sum + group.events.length, 0),
    [pastMonthGroups]
  );

  const timezone = getTimeZoneForRegion(region);

  const nextUpcomingEvent = React.useMemo(() => {
    // "Next" means the next event that has not started. An event ending today
    // is live, not next, and must not headline a planning export.
    const full = filteredEvents.filter((evt): evt is EventSummary => !isScheduleStub(evt));
    const now = new Date().getTime();
    const sorted = [...full].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    return sorted.find((event) => new Date(event.startDate).getTime() > now) || null;
  }, [filteredEvents]);

  const liveEvent = React.useMemo(() => {
    const full = filteredEvents.filter((evt): evt is EventSummary => !isScheduleStub(evt));
    const now = new Date().getTime();
    return (
      full.find((event) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();
        return start <= now && end >= now;
      }) || null
    );
  }, [filteredEvents]);

  const nextExportEvent = nextUpcomingEvent ?? liveEvent;
  const exportIsLive = !nextUpcomingEvent && Boolean(liveEvent);

  // The page's lead answer: the event a delegate can attend right now, or the
  // next one that opens. Concluded events never qualify.
  const nextAttendableEvent = React.useMemo(() => {
    const full = filteredEvents.filter((evt): evt is EventSummary => !isScheduleStub(evt));
    if (full.length === 0) return null;
    const now = new Date().getTime();
    const sorted = [...full].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const live = sorted.find((event) => {
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();
      return start <= now && end >= now;
    });
    if (live) return { event: live, live: true };
    const upcoming = sorted.find((event) => new Date(event.startDate).getTime() > now);
    return upcoming ? { event: upcoming, live: false } : null;
  }, [filteredEvents]);

  const nextAttendableDays = nextAttendableEvent
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextAttendableEvent.event.startDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  // Exports carry full rows only: stubs have no title, slug, or venue to
  // serialize, and must never leak identity into downloaded files. Concluded
  // events are opt-in so the default export is a planning artifact.
  const exportableEvents = React.useMemo(
    () =>
      filteredEvents.filter((evt): evt is EventSummary => {
        if (isScheduleStub(evt)) return false;
        if (includeConcludedInExport) return true;
        return !getEventTemporalStatus(evt.startDate, evt.endDate).isPast;
      }),
    [filteredEvents, includeConcludedInExport]
  );

  const toggleExportMenu = () => {
    const rect = exportTriggerRef.current?.getBoundingClientRect();
    setExportMenuUp(Boolean(rect && rect.bottom > window.innerHeight * 0.6));
    setExportOpen((prev) => !prev);
  };

  const handleExportICal = () => {
    setIsExporting(true);
    setExportError(null);
    const filename = `xpo-${region}-schedule.ics`;
    const calendarTitle = `XPO MICE ${tReg(`${region}.name`)} Event Calendar`;
    const ok = downloadICalFile(exportableEvents, filename, calendarTitle, eventDetailsOrigin);
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
    const ok = downloadCsvSchedule(exportableEvents, filename);
    if (!ok) {
      setExportError(tCal('exportFailed') || 'Export failed. No events to export or your browser blocked the download.');
      return;
    }
    setExportOpen(false);
  };

  const handleCopyPlainText = async () => {
    try {
      setExportError(null);
      const text = generatePlainTextSchedule(exportableEvents, locale);
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

  const renderMonthGroup = (monthGroup: CalendarMonthGroup) => (
    <div
      key={monthGroup.key}
      id={`month-${monthGroup.key}`}
      className="space-y-4 scroll-mt-24"
    >
      {/* Sticky Milestone Header */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-sm sm:text-base font-bold text-foreground capitalize">
            {monthGroup.monthTitle}
          </h3>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {monthGroup.events.length === 1
            ? tCal('eventsCountOne') || '1 event'
            : tCal('eventsCount', { count: monthGroup.events.length })}
        </Badge>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {monthGroup.events.map((evt) => {
          if (isScheduleStub(evt)) {
            return (
              <div
                key={evt.id}
                className="flex flex-col justify-between rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 space-y-2"
              >
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded self-start">
                  {evt.venueHallName}
                </span>
                <p className="text-sm font-bold text-foreground">{tCom('discreetEventLabel')}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(evt.startDate, evt.endDate, locale, timezone)}
                </p>
              </div>
            );
          }
          const tokens = getArchetypeTokens(evt.archetype);
          // Same readable-tone rule as EventCard: raw primaries
          // fail 4.5:1 on light surfaces for several hues.
          const labelTones = getReadableArchetypeLabel(tokens.primary);
          const dateRange = formatDateRange(evt.startDate, evt.endDate, locale, timezone);
          const temporal = getEventTemporalStatus(evt.startDate, evt.endDate);

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
              data-temporal={temporal.status.toLowerCase()}
              className={cn(
                'group relative flex flex-col justify-between rounded-xl border p-4 transition-all shadow-xs space-y-3',
                temporal.isPast
                  ? 'border-border/60 bg-muted/20'
                  : 'border-border/80 bg-card hover:border-primary/50'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold uppercase py-1 text-[var(--archetype-label)] dark:text-[var(--archetype-label-dark)]"
                      style={{
                        "--archetype-label": labelTones.light,
                        "--archetype-label-dark": labelTones.dark,
                        borderColor: `${tokens.primary}55`,
                        backgroundColor: `${tokens.primary}12`,
                      } as React.CSSProperties}
                    >
                      {archetypeTitle}
                    </Badge>
                    {temporal.isPast && (
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {tCal('concluded') || 'Concluded'}
                      </Badge>
                    )}
                    {temporal.isLive && (
                      <Badge variant="success" className="text-xs font-semibold gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                        {tCal('liveNow') || 'Live now'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {evt.venueHallName || tEvents('hallDefault') || 'Main Exhibition Halls'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-2">
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
                  {evt.transitInfo && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary/80 shrink-0 mt-0.5" />
                      <span className="line-clamp-1" title={evt.transitInfo}>
                        {evt.transitInfo}
                      </span>
                    </div>
                  )}
                </div>

                {evt.agendaItems && evt.agendaItems.length > 0 ? (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleSessions(evt.id)}
                      aria-expanded={expandedSessions.has(evt.id)}
                      className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold text-primary min-h-[44px] sm:min-h-[32px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {tCal('sessions') || 'Sessions'} ({evt.agendaItems.length})
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          expandedSessions.has(evt.id) && 'rotate-180'
                        )}
                      />
                    </button>
                    {expandedSessions.has(evt.id) && (
                      <ul className="space-y-2 pt-1">
                        {evt.agendaItems.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-lg border border-border/60 bg-background/60 p-2"
                          >
                            <p className="text-xs font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(item.startTime, locale, timezone)} ·{' '}
                              {formatTime(item.startTime, locale, timezone)}–
                              {formatTime(item.endTime, locale, timezone)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.location}
                              {item.track ? ` · ${item.track}` : ''}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : !temporal.isPast ? (
                  <p className="text-xs text-muted-foreground">
                    {tCal('sessionsNotPublished') ||
                      'Session times not published by the organizer.'}
                  </p>
                ) : null}
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center gap-1.5">
                <Link
                  href={`/${locale}/events/${evt.slug}`}
                  className={buttonVariants({
                    variant: temporal.isPast ? 'outline' : 'default',
                    size: 'sm',
                    className: 'relative z-10 flex-1 gap-1.5 text-xs font-semibold min-h-[44px] sm:min-h-[36px] cursor-pointer',
                  })}
                >
                  {temporal.isPast ? (
                    <ExternalLink className="h-3.5 w-3.5" />
                  ) : (
                    <Ticket className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {temporal.isPast
                      ? tCal('viewRecap') || 'View recap'
                      : tTix('viewPass') || 'View Event & Tickets'}
                  </span>
                </Link>
                <a
                  href={generateGoogleCalendarUrl(evt, eventDetailsOrigin, timezone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${tCal('googleCalendar') || 'Google Calendar'}: ${evt.title}`}
                  title={tCal('googleCalendar') || 'Google Calendar'}
                  className="relative z-10 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-[36px] sm:min-w-[36px] shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <CalendarPlus className="h-4 w-4" />
                </a>
                <a
                  href={generateOutlookWebUrl(evt, eventDetailsOrigin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${tCal('outlookWeb') || 'Outlook 365 Web'}: ${evt.title}`}
                  title={tCal('outlookWeb') || 'Outlook 365 Web'}
                  className="relative z-10 inline-flex h-11 w-11 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-[36px] sm:min-w-[36px] shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>

  );

  return (
    <div className="space-y-8">
      {/* 1. Interactive Calendar Matrix & Day Timetable Widget (Workspace Lead) */}
      <EventCalendarWidget
        events={filteredEvents}
        locale={locale}
        regionCode={region}
        isCalendarPage={true}
        onJumpToDate={handleWidgetDateSelect}
      />

      {/* 2. Next up: the present-tense answer before the archive */}
      {nextAttendableEvent && (
        <section
          aria-labelledby="calendar-next-up"
          className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tCal('nextUp') || 'Next up'}
                </span>
                {nextAttendableEvent.live ? (
                  <Badge variant="success" className="text-xs font-semibold gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                    {tCal('liveNow') || 'Live now'}
                  </Badge>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    {nextAttendableDays === 0
                      ? tCal('endsToday') || 'Starts today'
                      : nextAttendableDays === 1
                        ? tCal('startsInOneDay') || 'Starts tomorrow'
                        : tCal('startsInDays', { count: nextAttendableDays })}
                  </span>
                )}
              </div>
              <h2
                id="calendar-next-up"
                className="text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-2"
              >
                <Link
                  href={`/${locale}/events/${nextAttendableEvent.event.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {nextAttendableEvent.event.title}
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {formatDateRange(
                  nextAttendableEvent.event.startDate,
                  nextAttendableEvent.event.endDate,
                  locale,
                  timezone
                )}
                {' · '}
                {nextAttendableEvent.event.venueName}
                {' · '}
                {nextAttendableEvent.event.venueHallName ||
                  tEvents('hallDefault') ||
                  'Main Exhibition Halls'}
              </p>
            </div>
            <Link
              href={`/${locale}/events/${nextAttendableEvent.event.slug}`}
              className={buttonVariants({
                size: 'sm',
                className: 'shrink-0 gap-1.5 text-xs font-semibold min-h-[44px] sm:min-h-[36px]',
              })}
            >
              <Ticket className="h-3.5 w-3.5" />
              {tTix('viewPass') || 'View Event & Tickets'}
            </Link>
          </div>
        </section>
      )}

      {/* 3. Taxonomy & Filter Controls */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {tArch('browseByCategory')}
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
              {filteredEvents.length === 0
                ? tCal('noEventsFoundDesc') || 'No confirmed trade shows match your active filters.'
                : tCal('confirmedScheduleDesc', {
                    count: filteredEvents.length,
                    region: tReg(`${region}.name`),
                  }) ||
                  `${filteredEvents.length} confirmed MICE trade exhibitions & keynotes in ${tReg(`${region}.name`)}.`}
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
              disabled={isExporting || exportableEvents.length === 0}
              className="gap-1.5 text-xs font-semibold cursor-pointer min-h-[44px] sm:min-h-[36px]"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>{isExporting ? (tCal('generating') || 'Generating .ics...') : `${tCal('exportICal') || 'Export iCal (.ics)'} · ${exportableEvents.length}`}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              id="calendar-export-trigger"
              onClick={toggleExportMenu}
              disabled={filteredEvents.length === 0}
              className="px-2 text-xs font-semibold cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
              aria-label={tCal('moreExportFormats') || 'More export formats'}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              aria-controls="calendar-export-menu"
              ref={exportTriggerRef}
            >
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', exportOpen && 'rotate-180')} />
            </Button>

            {exportOpen && (
              <div
                id="calendar-export-menu"
                className={cn(
                  'absolute right-0 w-72 sm:w-80 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1.5 shadow-lg z-30 space-y-1 animate-in fade-in-50 zoom-in-95',
                  exportMenuUp ? 'bottom-full mb-2' : 'top-full mt-2'
                )}
                role="menu"
                aria-labelledby="calendar-export-trigger"
                aria-orientation="vertical"
                onKeyDown={handleExportMenuKeyDown}
              >
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={includeConcludedInExport}
                  onClick={() => setIncludeConcludedInExport((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-left text-xs font-medium text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <span>{tCal('includeConcluded') || 'Include concluded events'}</span>
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border',
                      includeConcludedInExport
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    )}
                    aria-hidden="true"
                  >
                    {includeConcludedInExport && <Check className="h-3 w-3" />}
                  </span>
                </button>

                {/* Group 1: whole filtered set */}
                <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tCal('exportBulkGroup') || 'Full filtered set'} ({exportableEvents.length})
                </p>
                {/* Option 1: .ics download */}
                <button
                  type="button"
                  onClick={handleExportICal}
                  disabled={isExporting || exportableEvents.length === 0}
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
                      {(tCal('icalApps') || 'Apple Calendar, Outlook, Thunderbird')} · {tCal('eventsCount', { count: exportableEvents.length })}
                    </p>
                  </div>
                </button>

                {/* Group 2: one event only */}
                {nextExportEvent && (
                  <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {tCal('exportSingleGroup') || 'Single event'}
                  </p>
                )}

                {/* Option 2: Google Calendar */}
                {nextExportEvent && (
                  <a
                    href={generateGoogleCalendarUrl(nextExportEvent, eventDetailsOrigin, timezone)}
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
                        {exportIsLive ? (tCal('addLive', { title: nextExportEvent.title }) || `Add live: ${nextExportEvent.title}`) : (tCal('addNext', { title: nextExportEvent.title }) || `Add next: ${nextExportEvent.title}`)}
                      </p>
                    </div>
                  </a>
                )}

                {/* Option 3: Outlook 365 Web */}
                {nextExportEvent && (
                  <a
                    href={generateOutlookWebUrl(nextExportEvent, eventDetailsOrigin)}
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
                        {exportIsLive ? (tCal('addLive', { title: nextExportEvent.title }) || `Add live: ${nextExportEvent.title}`) : (tCal('addNext', { title: nextExportEvent.title }) || `Add next: ${nextExportEvent.title}`)}
                      </p>
                    </div>
                  </a>
                )}

                {/* Option 4: CSV Spreadsheet */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={exportableEvents.length === 0}
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
                      {(tCal('csvDesc') || 'RFC 4180 format for Excel and Sheets')} · {tCal('eventsCount', { count: exportableEvents.length })}
                    </p>
                  </div>
                </button>

                {/* Option 5: Copy plain text itinerary */}
                <button
                  type="button"
                  onClick={handleCopyPlainText}
                  disabled={exportableEvents.length === 0}
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
                      {copiedText ? (tCal('copiedDesc') || 'Ready to paste into chat or docs') : `${tCal('copyDesc') || 'Plain-text agenda'} · ${exportableEvents.length} events`}
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
          <p role="status" aria-live="polite" className="sr-only">
            {copiedText ? tCal('copiedTitle') || 'Schedule copied' : ''}
          </p>
        </div>

        {/* Venue Filter Bar */}
        {availableVenues.length > 1 && (
          <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pr-10 scrollbar-none">
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
                  ? 'border-primary bg-primary text-white dark:text-slate-950 shadow-xs'
                  : 'border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{tCal('allVenues') || 'All Venues'}</span>
              <span className="text-xs font-mono">({archetypeFilteredEvents.length})</span>
            </button>

            {availableVenues.map((venueName) => {
              const count = archetypeFilteredEvents.filter((e) => !isScheduleStub(e) && e.venueName === venueName).length;
              const isSelected = selectedVenue.toLowerCase() === venueName.toLowerCase();

              return (
                <button
                  key={venueName}
                  type="button"
                  onClick={() => handleSelectVenue(venueName)}
                  className={cn(
                    'min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                    isSelected
                      ? 'border-primary bg-primary text-white dark:text-slate-950 font-semibold shadow-xs'
                      : 'border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span>{venueName}</span>
                  <span className="text-xs font-mono">({count})</span>
                </button>
              );
            })}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-end pr-1 sm:hidden"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          </div>
        )}

        {/* Monthly Chunked Event Groups */}
        {eventsByMonth.length > 0 ? (
          <div className="space-y-8">
            {currentMonthGroups.map(renderMonthGroup)}
            {pastMonthGroups.length > 0 && (
              <div className="space-y-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setPastExpanded((prev) => !prev)}
                  aria-expanded={pastExpanded}
                  className="gap-1.5 text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>
                    {pastExpanded
                      ? tCal('hidePast') || 'Hide past events'
                      : tCal('pastEvents', { count: pastEventCount }) ||
                        `Past events (${pastEventCount})`}
                  </span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', pastExpanded && 'rotate-180')}
                  />
                </Button>
                {pastExpanded && pastMonthGroups.map(renderMonthGroup)}
              </div>
            )}
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
