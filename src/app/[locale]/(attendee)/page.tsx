import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import {
  Compass,
  Layers,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Building2,
  Ticket,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/Button';
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

  const tHome = await getTranslations({ locale, namespace: 'home' });
  const tReg = await getTranslations({ locale, namespace: 'regions' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

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

  const regionLocalizedName =
    activeRegionCode === 'id'
      ? tReg('id.name') || 'Indonesia'
      : activeRegionCode === 'jp'
      ? tReg('jp.name') || 'Japan'
      : tReg('global.name') || 'Global Gateways';

  return (
    <div className="flex flex-col gap-10 sm:gap-14 pb-24 md:pb-16">
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
              <Compass className="h-4 w-4" />
              <span>{tHome('featuredTradeShows') || 'Upcoming Trade Shows & Conventions'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground text-balance">
              {tHome('featuredInRegion') || 'Featured Exhibitions in'} {regionLocalizedName}
            </h2>
          </div>

          <Link
            href={`/${locale}/events`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-[36px] gap-1.5 text-xs font-semibold')}
          >
            <span>{tHome('viewFullSchedule') || 'View Full Schedule'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground text-balance">
                {tHome('noUpcomingEventsInRegion') || 'No upcoming exhibitions scheduled in this country edition yet.'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-pretty">
                {tHome('noUpcomingEventsInRegionDesc') || 'Discover upcoming flagship summits in other country editions or browse the full event calendar.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Link
                href={`/${locale}/events`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-[36px] text-xs font-semibold gap-1.5')}
              >
                <span>{tHome('browseAllRegionsEvents') || tNav('events') || 'Browse All Exhibitions'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/${locale}/venues`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'min-h-[36px] text-xs font-semibold gap-1.5')}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>{tNav('venues') || 'Venue Directory'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {featuredEvents.map((event, idx) => (
              <EventCard key={event.id} event={event} locale={locale} priority={idx < 3} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Attendee Experience & Venue Wayfinding Hub (Asymmetric Bento Showcase) */}
      <section className="container space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground text-balance">
            {tHome('completeSolutionsTitle') || 'Attendee Experience & Venue Wayfinding Hub'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            {tHome('completeSolutionsSubtitle') || 'Essential tools for physical convention attendance: interactive hall maps, offline turnstile passes, and verified schedules.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento Cell 1: Interactive Hall Maps & Wayfinding (Dominant Primary Cell - 7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Hall Wayfinding
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-balance">
                  {tHome('attendeeTitle') || 'Interactive Hall Maps & Indoor Wayfinding'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {tHome('attendeeDesc') || 'Explore high-resolution hall layouts, locate exhibitor booths, keynote stages, and transit connections across world-class convention complexes.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-foreground border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tHome('attendeePill1') || 'Exact Hall Specifications'}</span>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-foreground border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tHome('attendeePill2') || 'Direct Transit & Shuttle Access'}</span>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-foreground border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tHome('attendeePill3') || 'Interactive Stage Schedules'}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 mt-6 flex items-center justify-between">
              <Link
                href={`/${locale}/venues`}
                className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'min-h-[36px] gap-2 font-semibold')}
              >
                <span>{tHome('attendeeCta') || 'Explore Venues & Halls'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Cell 2: Offline Cryptographic Passes (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-indigo-500/5 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Ticket className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Instant Turnstile
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-balance">
                  {tHome('passHubTitle') || 'Offline Cryptographic Passes'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {tHome('passHubDesc') || 'Access tamper-proof HMAC-SHA256 digital passes stored securely on your device. Scan through optical turnstiles in under 2 seconds without internet access.'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-foreground">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>{tHome('passHubPill1') || 'Offline Local Storage'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>{tHome('passHubPill2') || 'Instant Optical Scan'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>{tHome('passHubPill3') || 'Cryptographic Verification'}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 mt-6">
              <Link
                href={`/${locale}/my-tickets`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-[36px] w-full gap-2 font-semibold justify-center')}
              >
                <span>{tHome('passHubCta') || 'View My Passes'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Cell 3: B2B Deal-Rooms, VIP Privileges & Day-of Perks (Panoramic 12 Cols) */}
          <div className="lg:col-span-12 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-emerald-500/5 p-6 sm:p-8 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground text-balance">
                    {tHome('networkingPerksTitle') || 'B2B Deal-Rooms, VIP Privileges & Day-of Perks'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
                  {tHome('networkingPerksDesc') || 'Unlock executive buyer lounges, pre-scheduled bilateral meeting rooms, CME accreditation for medical symposiums, and curated attendee guidebook perks.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 lg:max-w-2xl w-full lg:w-auto">
                <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-foreground border border-border/40">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{tHome('networkingPerksPill1') || 'B2B Procurement Matchmaking'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-foreground border border-border/40">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{tHome('networkingPerksPill2') || 'VIP Executive Lounge Access'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-foreground border border-border/40">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{tHome('networkingPerksPill3') || 'Accredited Symposium Tracks'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizer Callout Strip (Secondary Audience Routing) */}
        <div className="rounded-xl border border-border/60 bg-muted/30 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground text-center sm:text-left">
            <Layers className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong className="text-foreground font-semibold">{tHome('organizerCalloutTitle') || 'Hosting an Exhibition or Industry Summit?'}</strong>{' '}
              {tHome('organizerCalloutDesc') || 'Access the Organizer Portal to publish events, configure booth allocations, customize visual themes, and deploy optical turnstile check-in.'}
            </span>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-[36px] text-xs font-semibold gap-1.5 shrink-0')}
          >
            <span>{tHome('organizerCalloutBtn') || 'Open Organizer Portal'}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* 7. Event Concierge & System Preferences Banner */}
      <section className="container">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-sm">
              <Cpu className="h-5 w-5" />
              <span>{tHome('conciergeBannerTitle') || 'Attendee Event Concierge & Reporting Hub'}</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl text-pretty">
              {tHome('conciergeBannerDesc') || 'Access real-time hall navigation, transit logistics, timetable schedules, and comprehensive organizer analytics reports.'}
            </p>
          </div>
          <Link
            href={`/${locale}/settings`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-[36px] whitespace-nowrap gap-2 text-xs')}
          >
            <span>{tHome('conciergeBannerBtn') || 'Preferences & Concierge Settings'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
