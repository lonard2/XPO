import * as React from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbJsonLd } from "@/components/layout/Breadcrumbs";
import { db } from '@/lib/db';
import { scheduleWhere, toScheduleRows, isScheduleStub, type ScheduleStub } from '@/lib/discovery/presentation';
import { normalizeRegion, regionForLocale, resolveActiveRegion } from '@/lib/i18n/geo';
import { siteBaseUrl } from '@/lib/seo/site';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { CalendarInteractiveView } from '@/components/discovery/CalendarInteractiveView';
import { Badge } from '@/components/ui/Badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type EventSummary } from '@/types/discovery';

interface CalendarPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string; archetype?: string; venue?: string }>;
}

export async function generateMetadata({ params }: CalendarPageProps) {
  const { locale } = await params;
  const tCal = await getTranslations({ locale, namespace: 'calendar' });
  const base = siteBaseUrl();
  const canonical = `${base}/${locale}/calendar`;
  const title = tCal('title') || 'Interactive Event Calendar';
  const description =
    tCal('subtitle') ||
    'Browse comprehensive MICE trade show calendars, multi-track keynote timetables, and exhibition schedules.';

  const languages: Record<string, string> = {
    en: `${base}/en/calendar`,
    id: `${base}/id/calendar`,
    ja: `${base}/ja/calendar`,
    'zh-CN': `${base}/zh-CN/calendar`,
    de: `${base}/de/calendar`,
    es: `${base}/es/calendar`,
    'x-default': `${base}/en/calendar`,
  };

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'XPO MICE Platform',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CalendarPage({ params, searchParams }: CalendarPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tCal = await getTranslations({ locale, namespace: 'calendar' });
  const tCom = await getTranslations({ locale, namespace: 'common' });
  const tReg = await getTranslations({ locale, namespace: 'regions' });
  const tDisc = await getTranslations({ locale, namespace: 'discovery' });

  const headerList = await headers();
  const cookieStore = await cookies();
  const rawSearchParams = await searchParams;

  const rawRegion = rawSearchParams.region;
  const localeRegion = regionForLocale(locale);
  const region =
    localeRegion ??
    resolveActiveRegion({
      locale,
      explicitRegion: rawRegion,
      cookieRegion: cookieStore.get('xpo_region')?.value,
      geoRegion: headerList.get('x-xpo-region'),
    });

  // The edition is part of the URL, not a hidden cookie. A pasted link must
  // reproduce the same country even after the visitor changes editions.
  if (!normalizeRegion(rawRegion)) {
    redirect(`/${locale}/calendar?region=${region}`);
  }
  const archetype = rawSearchParams.archetype || 'all';
  const initialVenue = rawSearchParams.venue || 'all';

  let events: any[] = [];
  try {
    const whereClause: any = { ...scheduleWhere(), venue: { regionId: region } };

    events = await db.event.findMany({
      where: whereClause,
      include: {
        venue: true,
        venueHall: true,
        ticketTiers: true,
        agendaItems: { orderBy: { startTime: 'asc' } },
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

  const mappedEvents: Array<EventSummary | ScheduleStub> = toScheduleRows(events).map((e: any) => (
    isScheduleStub(e)
      ? e
      : {
    id: e.id,
    title: e.title,
    slug: e.slug,
    archetype: e.archetype,
    startDate: e.startDate,
    endDate: e.endDate,
    venueName: e.venue?.name || 'Grand Convention Hall',
    venueHallName: e.venueHall?.name || null,
    venueSlug: e.venue?.slug || null,
    transitInfo: e.venue?.transitInfo || null,
    cityName: e.venue?.city || 'Jakarta',
    regionCode: region,
    isFeatured: Boolean(e.isFeatured),
    lowestPrice:
      (e.ticketTiers || []).length > 0
        ? Math.min(...(e.ticketTiers || []).map((tier: any) => tier.price))
        : 0,
    currency:
      (e.ticketTiers || [])[0]?.currency ||
      (region === 'id' ? 'IDR' : region === 'jp' ? 'JPY' : 'USD'),
    agendaItems: (e.agendaItems || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      track: item.track,
      speakerName: item.speakerName,
    })),
  }));

  const crumbs = [
    { label: tCom("home") || "Home", href: `/${locale}` },
    { label: tCal("title") || "Master Event Calendar", href: `/${locale}/calendar` },
  ];

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={crumbs} />
          <Badge variant="outline" className="hidden sm:inline-flex text-xs font-semibold gap-1.5 uppercase px-2.5 py-1">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>{tDisc('editionContext', { region: tReg(`${region}.name`) })}</span>
          </Badge>
        </div>
        <BreadcrumbJsonLd items={crumbs} />

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
          initialVenue={initialVenue}
          eventDetailsOrigin={`${siteBaseUrl()}/${locale}`}
        />
      </div>
    </div>
  );
}
