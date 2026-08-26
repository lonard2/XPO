import * as React from 'react';
import { cookies, headers } from 'next/headers';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { CalendarInteractiveView } from '@/components/discovery/CalendarInteractiveView';
import { Badge } from '@/components/ui/Badge';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
  setRequestLocale(locale);

  const tCal = await getTranslations({ locale, namespace: 'calendar' });
  const tCom = await getTranslations({ locale, namespace: 'common' });

  const headerList = await headers();
  const cookieStore = await cookies();
  const geoHeaderRegion = headerList.get('x-xpo-region');
  const cookieRegion = cookieStore.get('xpo_region')?.value;
  const rawSearchParams = await searchParams;

  const region = (
    rawSearchParams.region ||
    cookieRegion ||
    geoHeaderRegion ||
    'id'
  ).toLowerCase();
  const archetype = rawSearchParams.archetype || 'all';

  let events: any[] = [];
  try {
    const whereClause: any = {};
    if (region && region !== 'global') {
      whereClause.venue = { regionId: region };
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
    events = [];
  }

  if (!events || events.length === 0) {
    events = FALLBACK_EVENTS.filter((e) => {
      const code = (e.region?.code || e.regionId || '').toLowerCase();
      if (region === 'id') return code === 'id';
      if (region === 'jp') return code === 'jp';
      if (region === 'global') return code === 'global' || code === 'gl';
      return true;
    });
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
            <span>{tCom('back') || 'Back'}</span>
          </Link>

          <Badge variant="outline" className="text-xs font-semibold gap-1.5 uppercase px-2.5 py-1">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>{region.toUpperCase()} {tCal('title') || 'Master Timetable'}</span>
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="space-y-2 border-b border-border/80 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {tCal('title') || 'MICE Master Event Calendar'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            {tCal('subtitle') || 'Interactive multi-track timetable across all major convention centers, exhibition halls, and conference stages.'}
          </p>
        </div>

        {/* Interactive Discovery & Timetable Workspace */}
        <CalendarInteractiveView
          initialEvents={mappedEvents}
          locale={locale}
          region={region}
          initialArchetype={archetype}
        />
      </div>
    </div>
  );
}
