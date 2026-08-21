import * as React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';
import { Badge } from '@/components/ui/Badge';
import { Calendar as CalendarIcon, MapPin, Building2, Ticket, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type EventSummary } from '@/types/discovery';

interface CalendarPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string; archetype?: string }>;
}

export async function generateMetadata({ params }: CalendarPageProps) {
  const { locale } = await params;
  return {
    title: `Event Calendar & Timetable | XPO (${locale.toUpperCase()})`,
    description: 'Browse comprehensive MICE trade show calendars, multi-track keynote timetables, and exhibition schedules.',
  };
}

export default async function CalendarPage({ params, searchParams }: CalendarPageProps) {
  const { locale } = await params;
  const { region = 'id', archetype } = await searchParams;

  let events: any[] = [];
  try {
    const whereClause: any = {};
    if (region && region !== 'global') {
      whereClause.venue = { regionId: region };
    }
    if (archetype) {
      whereClause.archetype = archetype;
    }

    events = await db.event.findMany({
      where: whereClause,
      include: {
        venue: true,
        venueHall: true,
      },
      orderBy: { startDate: 'asc' },
    });
  } catch {
    events = FALLBACK_EVENTS;
  }

  const mappedEvents: EventSummary[] = events.map((e: any) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    archetype: e.archetype,
    startDate: e.startDate,
    endDate: e.endDate,
    venueName: e.venue?.name || 'Grand Convention Hall',
    venueHallName: e.venueHall?.name || null,
    cityName: e.venue?.city || 'Jakarta',
    regionCode: region,
    isFeatured: Boolean(e.isFeatured),
    lowestPrice: 0,
    currency: region === 'id' ? 'IDR' : region === 'jp' ? 'JPY' : 'USD',
  }));

  const timezone = getTimeZoneForRegion(region);

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Discovery</span>
          </Link>

          <Badge variant="outline" className="text-xs font-semibold gap-1 uppercase">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>{region.toUpperCase()} Edition Master Timetable</span>
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="space-y-2 border-b border-border/80 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            MICE Master Event Calendar
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Interactive multi-track timetable across all major convention centers, exhibition halls, and conference stages.
          </p>
        </div>

        {/* Category Filter Pills */}
        <EventCategoryPills locale={locale} activeCategoryId={archetype} />

        {/* Interactive Calendar Widget */}
        <EventCalendarWidget
          events={mappedEvents}
          locale={locale}
          regionCode={region}
        />

        {/* Full Chronological Timetable Section */}
        <div className="space-y-4 pt-6 border-t border-border/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Chronological Schedule Overview
              </h2>
              <p className="text-xs text-muted-foreground">All confirmed events ordered by start date.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>Export iCal (.ics)</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mappedEvents.map((evt: EventSummary) => {
              const tokens = getArchetypeTokens(evt.archetype);
              const dateRange = formatDateRange(evt.startDate, evt.endDate, locale, timezone);

              return (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 hover:border-primary/50 transition-all shadow-xs space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="default"
                        className="text-[10px] font-bold uppercase border-0"
                        style={{ backgroundColor: tokens.primary, color: '#ffffff' }}
                      >
                        {tokens.displayName}
                      </Badge>
                      {evt.venueHallName && (
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {evt.venueHallName}
                        </span>
                      )}
                    </div>

                    <Link href={`/${locale}/events/${evt.slug}`}>
                      <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                    </Link>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                        <span className="truncate">{evt.venueName} ({evt.cityName})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{dateRange}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <Link href={`/${locale}/events/${evt.slug}`} className="w-full">
                      <Button size="sm" className="w-full gap-1.5 text-xs font-semibold">
                        <Ticket className="h-3.5 w-3.5" />
                        <span>View Event & Tickets</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
