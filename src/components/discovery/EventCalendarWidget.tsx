'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type EventSummary } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface EventCalendarWidgetProps {
  events: EventSummary[];
  locale: string;
  regionCode?: string;
  isCalendarPage?: boolean;
  className?: string;
}

export function EventCalendarWidget({
  events,
  locale,
  regionCode = 'id',
  isCalendarPage = false,
  className,
}: EventCalendarWidgetProps) {
  const tCal = useTranslations('calendar');
  const tEvents = useTranslations('events');
  const tTickets = useTranslations('tickets');

  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [viewMonth, setViewMonth] = React.useState<Date>(() => new Date());

  const timezone = getTimeZoneForRegion(regionCode);

  // Month navigation
  const prevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  // Calendar math
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthName = viewMonth.toLocaleString(locale, { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array with padding
  const calendarDays: Array<{ dayNumber: number | null; date: Date | null }> = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ dayNumber: null, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ dayNumber: d, date: new Date(year, month, d) });
  }

  // Filter events active on selected date
  const eventsOnSelectedDate = React.useMemo(() => {
    return events.filter((evt) => {
      const start = new Date(evt.startDate);
      const end = new Date(evt.endDate);
      const sel = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      return sel >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             sel <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }, [events, selectedDate]);

  // Find nearest upcoming event from selectedDate
  const nearestUpcomingEvent = React.useMemo(() => {
    if (eventsOnSelectedDate.length > 0 || events.length === 0) return null;
    const sorted = [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const selTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    ).getTime();
    const upcoming = sorted.find(
      (evt) => new Date(evt.startDate).getTime() >= selTime
    );
    return upcoming || sorted[0];
  }, [events, eventsOnSelectedDate, selectedDate]);

  // Check if a calendar day has events
  const hasEventOnDay = (date: Date | null) => {
    if (!date) return false;
    return events.some((evt) => {
      const start = new Date(evt.startDate);
      const end = new Date(evt.endDate);
      const cur = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return cur >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             cur <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const selectedDateFormatted = selectedDate.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={cn('w-full space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              {tCal('guideTitle') || 'Event Calendar Guide'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tCal('guideSubtitle') || 'Select a date to preview active exhibitions and keynotes.'}
            </p>
          </div>
        </div>

        {!isCalendarPage && (
          <Link
            href={`/${locale}/calendar`}
            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5 text-xs font-semibold' })}
          >
            <span>{tCal('fullTimetable') || 'Full Multi-Track Timetable'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Dual Pane Layout (Calendar Matrix Left, Events Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        {/* Left: Mini Calendar Grid (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
          {/* Month Controller */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground capitalize">
              {monthName}
            </h4>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md cursor-pointer" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md cursor-pointer" onClick={nextMonth} aria-label="Next month">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1" role="grid">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber || !cell.date) {
                return <div key={`empty-${idx}`} className="h-9 min-h-[36px]" aria-hidden="true" />;
              }

              const hasEvents = hasEventOnDay(cell.date);
              const active = isSelected(cell.date);
              const today = isToday(cell.date);
              const cellDateStr = cell.date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <button
                  key={cell.dayNumber}
                  onClick={() => cell.date && setSelectedDate(cell.date)}
                  type="button"
                  aria-label={`${cellDateStr}${hasEvents ? ', events scheduled' : ''}`}
                  aria-selected={active}
                  aria-current={today ? 'date' : undefined}
                  className={cn(
                    'relative flex h-9 w-full min-h-[36px] flex-col items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                    active
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : today
                      ? 'border border-primary text-primary font-bold hover:bg-primary/10'
                      : 'text-foreground hover:bg-muted',
                    hasEvents && !active && 'font-bold'
                  )}
                >
                  <span>{cell.dayNumber}</span>
                  {hasEvents && (
                    <span
                      className={cn(
                        'absolute bottom-1 h-1 w-1 rounded-full',
                        active ? 'bg-white' : 'bg-primary'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Events on Selected Date (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-foreground">
              {tCal('eventsOnDate') || 'Schedule for'} {selectedDateFormatted}
            </span>
            <Badge variant="outline" className="text-[10px] font-medium">
              {eventsOnSelectedDate.length} {tEvents('title')?.split('&')?.[0]?.trim() || 'Events'}
            </Badge>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map((evt) => {
                const tokens = getArchetypeTokens(evt.archetype);
                const dates = formatDateRange(evt.startDate, evt.endDate, locale, timezone);

                return (
                  <div
                    key={evt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/80 p-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 uppercase font-semibold"
                          style={{ color: tokens.primary, borderColor: `${tokens.primary}44` }}
                        >
                          {tokens.displayName}
                        </Badge>
                        {evt.venueHallName && (
                          <span className="text-[10px] font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                            {evt.venueHallName}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {evt.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-primary/70 shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                          <span>{dates}</span>
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/events/${evt.slug}`}
                      className={buttonVariants({ size: 'sm', className: 'gap-1 text-xs shrink-0 self-start sm:self-auto cursor-pointer font-semibold' })}
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      <span>{tTickets('viewPass') || tTickets('bookPass') || 'Pass'}</span>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground space-y-3 bg-muted/20">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {tCal('noEventsOnDate') || 'No events scheduled on this day.'}
                  </p>
                  <p className="text-xs">
                    Click any highlighted date dot on the calendar or jump directly to the next active trade show.
                  </p>
                </div>
                {nearestUpcomingEvent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const d = new Date(nearestUpcomingEvent.startDate);
                      setSelectedDate(d);
                      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                    }}
                    className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Jump to Next: {nearestUpcomingEvent.title}</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 text-right">
            <Link
              href={`/${locale}/events`}
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{tCal('monthView') || 'Explore all upcoming events by category'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
