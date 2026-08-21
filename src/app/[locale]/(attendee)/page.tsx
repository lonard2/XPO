import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
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
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BannerCarousel } from '@/components/discovery/BannerCarousel';
import { MajorVenuesUpcomingSection } from '@/components/discovery/MajorVenuesUpcomingSection';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { VenueSpotlightSection } from '@/components/discovery/VenueSpotlightSection';
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
  const activeRegionCode = (resolvedSearchParams?.region || 'id').toLowerCase();

  setRequestLocale(locale);

  // Fetch live data from Prisma with graceful fallback
  let bannerSlides: BannerSlide[] = FALLBACK_BANNER_SLIDES;
  let spotlightVenues: VenueSummary[] = FALLBACK_VENUES;
  let featuredEvents: DiscoveryEvent[] = FALLBACK_EVENTS;
  let majorVenuesWithEvents: VenueWithEvents[] = [];

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
      where: activeRegionCode !== 'global' ? { regionId: activeRegionCode } : undefined,
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
    // Fallback datasets populated
  }

  const regionNames: Record<string, string> = {
    id: 'Indonesia',
    jp: 'Japan',
    global: 'Global Hubs',
  };

  const currentEditionName = regionNames[activeRegionCode] || 'Indonesia';

  return (
    <div className="flex flex-col gap-10 sm:gap-14 pb-16">
      {/* 1. Hero Banner Carousel with High-Contrast Scrim & Mobile Ergonomics */}
      <section className="container pt-3 sm:pt-6">
        <BannerCarousel slides={bannerSlides} locale={locale} />
      </section>

      {/* 2. Dedicated Country Editions Switcher & Status Bar */}
      <section className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <span>Country Edition: </span>
              <span className="text-primary font-bold">{currentEditionName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${locale}?region=id`}>
              <Badge
                variant={activeRegionCode === 'id' ? 'default' : 'outline'}
                className="hover:border-primary cursor-pointer transition-all py-1.5 px-3 text-xs"
              >
                Indonesia Edition (JIExpo, ICE BSD, JICC)
              </Badge>
            </Link>
            <Link href={`/${locale}?region=jp`}>
              <Badge
                variant={activeRegionCode === 'jp' ? 'default' : 'outline'}
                className="hover:border-primary cursor-pointer transition-all py-1.5 px-3 text-xs"
              >
                Japan Edition (Tokyo Big Sight, Makuhari)
              </Badge>
            </Link>
            <Link href={`/${locale}?region=global`}>
              <Badge
                variant={activeRegionCode === 'global' ? 'default' : 'outline'}
                className="hover:border-primary cursor-pointer transition-all py-1.5 px-3 text-xs"
              >
                Global Edition (MBS Singapore, Frankfurt)
              </Badge>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Major Venues Current & Near-Upcoming Quick-Glance (Below Banner) */}
      {majorVenuesWithEvents.length > 0 && (
        <section className="container">
          <MajorVenuesUpcomingSection
            venues={majorVenuesWithEvents}
            locale={locale}
            regionCode={activeRegionCode}
          />
        </section>
      )}

      {/* 4. Event Category Quick Pills with Distinct Sector Identities */}
      <section className="container">
        <EventCategoryPills locale={locale} />
      </section>

      {/* 5. Integrated Interactive Event Calendar Guide */}
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

      {/* 6. Featured Trade Expos & Conferences Grid (Widescreen Multi-Column) */}
      <section className="container space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Upcoming Trade Shows & Conventions</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Featured Exhibitions in {currentEditionName}
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

      {/* 7. Convention Venue Spotlights */}
      <section className="container">
        <VenueSpotlightSection venues={spotlightVenues} locale={locale} />
      </section>

      {/* 8. Multi-Sided Platform Portals (Humanized Copywriting) */}
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
                <span>9 Domain Event Category Layouts</span>
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

      {/* 9. Event AI Assistant Banner */}
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
