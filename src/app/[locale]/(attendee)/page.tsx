import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import {
  Compass,
  Building2,
  Ticket,
  Sparkles,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { HeroSection } from '@/components/discovery/HeroSection';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventCard } from '@/components/discovery/EventCard';
import {
  FALLBACK_BANNER_SLIDES,
  FALLBACK_EVENTS,
  FALLBACK_VENUES,
} from '@/lib/discovery/fallbackData';
import { type BannerSlide, type DiscoveryEvent, type VenueSummary, type VenueWithEvents } from '@/types/discovery';

export interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ region?: string }>;
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  // 1. Resolve active region: explicit URL param > cookie > geo header > default 'id'
  const headerList = await headers();
  const cookieStore = await cookies();
  const geoHeaderRegion = headerList.get('x-xpo-region');
  const cookieRegion = cookieStore.get('xpo_region')?.value;

  const activeRegionCode = (
    resolvedSearchParams?.region ||
    cookieRegion ||
    geoHeaderRegion ||
    'id'
  ).toLowerCase();

  setRequestLocale(locale);

  // Filter fallback data specifically for the active region
  const regionFallbackVenues = FALLBACK_VENUES.filter((v) => {
    const code = (v.region?.code || v.regionId || '').toLowerCase();
    if (activeRegionCode === 'id') return code === 'id';
    if (activeRegionCode === 'jp') return code === 'jp';
    if (activeRegionCode === 'global') return code === 'global' || code === 'gl';
    return true;
  });

  const regionFallbackEvents = FALLBACK_EVENTS.filter((e) => {
    const code = (e.region?.code || e.regionId || '').toLowerCase();
    if (activeRegionCode === 'id') return code === 'id';
    if (activeRegionCode === 'jp') return code === 'jp';
    if (activeRegionCode === 'global') return code === 'global' || code === 'gl';
    return true;
  });

  const regionFallbackSlides = FALLBACK_BANNER_SLIDES.filter((s) => {
    const code = (s.regionCode || '').toLowerCase();
    if (activeRegionCode === 'id') return code === 'id';
    if (activeRegionCode === 'jp') return code === 'jp';
    if (activeRegionCode === 'global') return code === 'global' || code === 'gl';
    return true;
  });

  let bannerSlides: BannerSlide[] = regionFallbackSlides.length > 0 ? regionFallbackSlides : FALLBACK_BANNER_SLIDES;
  let spotlightVenues: VenueSummary[] = regionFallbackVenues.length > 0 ? regionFallbackVenues : FALLBACK_VENUES;
  let featuredEvents: DiscoveryEvent[] = regionFallbackEvents.length > 0 ? regionFallbackEvents : FALLBACK_EVENTS;
  let majorVenuesWithEvents: VenueWithEvents[] = regionFallbackVenues.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    city: v.city,
    address: v.address,
    transitInfo: v.transitInfo,
    imageUrl: v.imageUrl,
    regionCode: activeRegionCode,
    halls: v.halls || [],
    events: regionFallbackEvents
      .filter((e) => e.venueId === v.id || e.venue?.id === v.id || e.venue?.slug === v.slug)
      .map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        archetype: e.archetype,
        startDate: e.startDate,
        endDate: e.endDate,
        venueHallName: e.venueHall?.name || null,
        minPrice: e.ticketTiers?.[0]?.price ?? 0,
      })),
  }));

  try {
    const dbEvents = await db.event.findMany({
      where: activeRegionCode !== 'global' ? { regionId: activeRegionCode } : { regionId: 'global' },
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
      featuredEvents = dbEvents as unknown as DiscoveryEvent[];
      bannerSlides = dbEvents.filter((e) => e.isFeatured).map((evt) => {
        const lowestTier = evt.ticketTiers?.sort((a, b) => a.price - b.price)[0];
        return {
          id: evt.id,
          title: evt.title,
          tagline: evt.tagline,
          slug: evt.slug,
          heroImageUrl: evt.heroImageUrl,
          archetype: evt.archetype,
          startDate: evt.startDate,
          endDate: evt.endDate,
          venueName: evt.venue?.name,
          cityName: evt.venue?.city,
          regionCode: evt.region?.code || activeRegionCode,
          format: evt.format,
          scale: evt.scale,
          minPrice: lowestTier?.price ?? 0,
          currency: lowestTier?.currency || (activeRegionCode === 'id' ? 'IDR' : activeRegionCode === 'jp' ? 'JPY' : 'USD'),
          isFeatured: evt.isFeatured,
        };
      });

      if (bannerSlides.length === 0 && featuredEvents.length > 0) {
        bannerSlides = [featuredEvents[0] as unknown as BannerSlide];
      }
    }

    const dbVenues = await db.venue.findMany({
      where: activeRegionCode !== 'global' ? { regionId: activeRegionCode } : { regionId: 'global' },
      include: {
        halls: true,
        region: true,
        events: {
          include: {
            venueHall: true,
            ticketTiers: true,
          },
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
      take: 6,
    });

    if (dbVenues.length > 0) {
      spotlightVenues = dbVenues as unknown as VenueSummary[];
      majorVenuesWithEvents = dbVenues.map((v) => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        city: v.city,
        address: v.address,
        transitInfo: v.transitInfo,
        imageUrl: v.imageUrl,
        regionCode: activeRegionCode,
        halls: v.halls.map((h) => ({ id: h.id, name: h.name, capacity: h.capacity, floorAreaSqm: h.floorAreaSqm })),
        events: v.events.map((e) => ({
          id: e.id,
          title: e.title,
          slug: e.slug,
          archetype: e.archetype,
          startDate: e.startDate,
          endDate: e.endDate,
          venueHallName: e.venueHall?.name,
          minPrice: e.ticketTiers[0]?.price ?? 0,
        })),
      })) as VenueWithEvents[];
    }
  } catch {
    // Graceful fallback populated above
  }

  const regionNames: Record<string, string> = {
    id: 'Indonesia',
    jp: 'Japan',
    global: 'Global Hubs',
  };

  const currentRegionName = regionNames[activeRegionCode] || 'Indonesia';

  return (
    <div className="flex flex-col gap-10 sm:gap-14 pb-16">
      {/* 1. Unified Modern Hero Section: Banner Carousel + Stuck Horizontal Venue Quick-Glance Rail */}
      <section className="container pt-3 sm:pt-6">
        <HeroSection
          slides={bannerSlides}
          venues={majorVenuesWithEvents}
          locale={locale}
          regionCode={activeRegionCode}
        />
      </section>

      {/* 2. Horizontally Scrollable 15 MICE Event Category Cards */}
      <section className="container">
        <EventCategoryPills locale={locale} />
      </section>

      {/* 3. Integrated Interactive Event Calendar Guide */}
      <section className="container">
        <EventCalendarWidget
          events={featuredEvents.map((e) => ({
            id: e.id,
            title: e.title,
            slug: e.slug,
            archetype: e.archetype,
            startDate: e.startDate,
            endDate: e.endDate,
            venueName: e.venue?.name || 'Grand Convention Hall',
            venueHallName: e.venueHall?.name || null,
            cityName: e.venue?.city || 'Jakarta',
            regionCode: activeRegionCode,
            lowestPrice: e.ticketTiers?.[0]?.price ?? 0,
            currency: e.ticketTiers?.[0]?.currency || 'IDR',
          }))}
          locale={locale}
          regionCode={activeRegionCode}
        />
      </section>

      {/* 4. Featured Trade Expos & Conferences Grid (Widescreen Multi-Column) */}
      <section className="container space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Upcoming Trade Shows & Conventions</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Featured Exhibitions in {currentRegionName}
            </h2>
          </div>

          <Link href={`/${locale}/events`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <span>View Full Schedule</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      </section>

      {/* 5. Multi-Sided Platform Portals (Humanized Copywriting) */}
      <section className="container space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Complete Event Solutions for All Participants
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Dedicated portals crafted for attendees, event organizers, and venue directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendee Portal */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                <Compass className="h-6 w-6" />
              </div>
              <CardTitle>Attendee Experience</CardTitle>
              <CardDescription>
                Discover trade shows, reserve passes, explore interactive hall floor plans, and consult the AI concierge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>15 Domain Event Category Layouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant Digital Passes & QR Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Hall Floor Maps & Day-of Perks</span>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Portal */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>Organizer Portal</CardTitle>
              <CardDescription>
                Event publishing wizard, real-time live visual customizer, booth/tenant manager, and QR badge scanner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Live Split-Screen Customizer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Executive Analytics & Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Onsite QR Check-in System</span>
              </div>
            </CardContent>
          </Card>

          {/* Venue & Admin Governance */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>Venue & Platform Governance</CardTitle>
              <CardDescription>
                Convention center directory with exact hall indexing, automated event calendar scrapers, and audit logging.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Exact Venue & Hall Mapping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Event Ingestion Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. Event AI Assistant Banner */}
      <section className="container">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-sm">
              <Cpu className="h-5 w-5" />
              <span>Intelligent Event Assistant & Analytics</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Equipped with state-of-the-art AI for real-time attendee concierge transit advice, timetable navigation, and executive organizer digests.
            </p>
          </div>
          <Link href={`/${locale}/settings`}>
            <Button variant="outline" className="whitespace-nowrap gap-2 text-xs">
              <span>Preferences & AI Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
