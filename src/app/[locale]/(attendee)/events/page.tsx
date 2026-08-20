import { Suspense } from 'react';
import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Sparkles,
  Compass,
  ArrowLeft,
  Calendar,
  Building2,
  Globe,
} from 'lucide-react';
import { db } from '@/lib/db';
import { EventsExplorer } from '@/components/discovery/EventsExplorer';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { type DiscoveryEvent } from '@/types/discovery';

export interface EventsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { locale } = await params;
  return {
    title: 'Explore MICE Events & Trade Exhibitions | XPO',
    description: 'Search, filter, and discover premier international conventions, B2B trade shows, and developer summits across Indonesia, Japan, and global hubs.',
  };
}

export default async function EventsPage({ params, searchParams }: EventsPageProps) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  setRequestLocale(locale);

  // Fetch events from database
  let eventsList: DiscoveryEvent[] = FALLBACK_EVENTS;

  try {
    const dbEvents = await db.event.findMany({
      include: {
        venue: {
          include: {
            halls: true,
            region: true,
          },
        },
        venueHall: true,
        region: true,
        ticketTiers: true,
      },
      orderBy: { startDate: 'asc' },
    });

    if (dbEvents.length > 0) {
      eventsList = dbEvents as unknown as DiscoveryEvent[];
    }
  } catch {
    // Graceful fallback to pre-seeded realistic exhibitions
  }

  const initialFilters = {
    keyword: typeof rawSearchParams.q === 'string' ? rawSearchParams.q : '',
    region: typeof rawSearchParams.region === 'string' ? rawSearchParams.region : 'all',
    city: typeof rawSearchParams.city === 'string' ? rawSearchParams.city : 'all',
    archetype: typeof rawSearchParams.archetype === 'string' ? rawSearchParams.archetype : 'all',
    format: typeof rawSearchParams.format === 'string' ? rawSearchParams.format : 'all',
    scale: typeof rawSearchParams.scale === 'string' ? rawSearchParams.scale : 'all',
    dateRange: typeof rawSearchParams.dateRange === 'string' ? rawSearchParams.dateRange : 'all',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container flex items-center gap-2 text-xs text-muted-foreground px-4">
          <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Events & Exhibitions</span>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="container px-4">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Compass className="h-3.5 w-3.5" />
              <span>Attendee Discovery Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              MICE Events & International Expos
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore scheduled trade exhibitions, technical developer summits, medical congresses, and mega consumer pavilions with real-time multi-dimensional faceted search.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Client Explorer with SearchParams Suspense */}
      <Suspense fallback={
        <div className="container px-4 py-12 text-center text-xs text-muted-foreground">
          Loading discovery engine...
        </div>
      }>
        <EventsExplorer
          initialEvents={eventsList}
          locale={locale}
          initialFilters={initialFilters}
        />
      </Suspense>
    </div>
  );
}
