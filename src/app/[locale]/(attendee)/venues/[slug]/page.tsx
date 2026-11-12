import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbJsonLd } from '@/components/layout/Breadcrumbs';
import {
  Building2,
  MapPin,
  ArrowLeft,
  ArrowDown,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/db';
import { loadVenueSchedule } from '@/lib/discovery/schedule';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { VenueCampusExplorer } from '@/components/discovery/VenueCampusExplorer';
import { VenueMeetingRooms } from '@/components/discovery/VenueMeetingRooms';
import { VenueTransitHub } from '@/components/discovery/VenueTransitHub';
import { VenueScheduleTable } from '@/components/discovery/VenueScheduleTable';
import { FALLBACK_VENUES, FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { generatePlaceJsonLd } from '@/lib/seo/jsonLd';
import { siteBaseUrl } from '@/lib/seo/site';
import { hallsOnly, meetingRoomsOnly, countSpaces } from '@/lib/discovery/venueSpaces';
import { metricLabelKey, normalizeVenueType } from '@/lib/discovery/venueTypes';
import { type VenueSummary, type DiscoveryEvent } from '@/types/discovery';
import { type ScheduleStub } from '@/lib/discovery/presentation';

export interface VenueDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export function generateStaticParams() {
  return FALLBACK_VENUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: VenueDetailPageProps) {
  const { locale, slug } = await params;
  const base = siteBaseUrl();
  const venue = FALLBACK_VENUES.find((v) => v.slug === slug);
  const title = venue ? `${venue.name} | XPO Venue Hub` : 'Venue Hub | XPO';
  const description = venue
    ? `Explore hall specifications, spatial campus topology, rapid transit routes, and upcoming exhibitions at ${venue.name}.`
    : 'MICE Venue Specifications and upcoming events.';
  const url = `/${locale}/venues/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: `${base}${url}` },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      ...(venue?.imageUrl ? { images: [{ url: venue.imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(venue?.imageUrl ? { images: [venue.imageUrl] } : {}),
    },
  };
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tVen = await getTranslations({ locale, namespace: 'venues' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCom = await getTranslations({ locale, namespace: 'common' });
  const tReg = await getTranslations({ locale, namespace: 'regions' });
  const tFoot = await getTranslations({ locale, namespace: 'footer' });
  const tVenueType = await getTranslations({ locale, namespace: 'venueTypes' });

  let venue: VenueSummary | null = null;
  let upcomingEvents: Array<DiscoveryEvent | ScheduleStub> = [];

  try {
    const dbVenue = await db.venue.findUnique({
      where: { slug },
      include: {
        halls: true,
        region: true,
      },
    });

    if (dbVenue) {
      venue = dbVenue as unknown as VenueSummary;
      // Public rows in full; discreet rows projected to stubs at the query.
      upcomingEvents = await loadVenueSchedule(dbVenue.id);
    }
  } catch {
    // Graceful fallback
  }

  if (!venue) {
    venue = FALLBACK_VENUES.find((v) => v.slug === slug) || null;
    if (venue) {
      upcomingEvents = FALLBACK_EVENTS.filter((e) => e.venueId === venue?.id || e.venue?.slug === slug);
    }
  }

  if (!venue) {
    notFound();
  }

  const regionCode = (venue.region?.code || venue.regionId || 'ID').toUpperCase();
  const venueType = normalizeVenueType(venue.type);
  const venueHalls = hallsOnly(venue.halls || []);
  const venueMeetingRooms = meetingRoomsOnly(venue.halls || []);
  const spaceCount = countSpaces(venue.halls, venueType);
  const totalCapacity =
    venue.capacity ||
    venue.halls?.reduce((acc, h) => acc + (h.capacity || 0), 0) ||
    25000;
  const totalFloorArea = venue.halls?.reduce((acc, h) => acc + (h.floorAreaSqm || 0), 0) || 30000;

  const crumbs = [
    { label: tCom('home') || 'Home', href: `/${locale}` },
    { label: tVen('title')?.split('&')?.[0]?.trim() || 'Venues', href: `/${locale}/venues` },
    { label: venue.name, href: `/${locale}/venues/${venue.slug}` },
  ];

  const placeJsonLd = generatePlaceJsonLd(
    {
      name: venue.name,
      slug: venue.slug,
      city: venue.city,
      address: venue.address,
      latitude: venue.latitude ?? null,
      longitude: venue.longitude ?? null,
      transitInfo: venue.transitInfo,
      imageUrl: venue.imageUrl ?? null,
      regionId: venue.region?.code || venue.regionId,
      halls: (venue.halls || []).map((hall) => ({
        name: hall.name,
        capacity: hall.capacity ?? null,
        floorAreaSqm: hall.floorAreaSqm ?? null,
      })),
    },
    siteBaseUrl()
  );

  return (
    <div className="flex flex-col gap-10 pb-16">
      <Breadcrumbs variant="strip" items={crumbs} />
      <BreadcrumbJsonLd items={crumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />

      {/* Hero Venue Header Banner */}
      <section className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Image */}
            <div className="lg:col-span-6 relative aspect-video lg:aspect-auto lg:h-[380px] w-full overflow-hidden bg-muted">
              {venue.imageUrl ? (
                <img
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-background to-background">
                  <Building2 className="h-16 w-16 text-primary/40" />
                </div>
              )}
            </div>

            {/* Information Pane */}
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
                  <Globe className="h-3 w-3 mr-1 inline" />
                  {tVen("hub", { region: regionCode })}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {venue.city}
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {tVenueType(venueType)}
                </Badge>
                <Badge variant="success" className="text-xs font-semibold gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{tFoot('infrastructureBadge') || 'Verified MICE Complex'}</span>
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {venue.name}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{venue.address}</span>
              </p>

              {/* Metric Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-center">
                  <span className="text-xs uppercase font-semibold text-muted-foreground block">
                    {tVen(metricLabelKey(venueType))}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                    {spaceCount > 0 ? spaceCount : '—'}
                  </span>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-center">
                  <span className="text-xs uppercase font-semibold text-muted-foreground block">
                    {tReg('capacity') || 'Max Capacity'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                    {totalCapacity.toLocaleString()}
                  </span>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-center">
                  <span className="text-xs uppercase font-semibold text-muted-foreground block">
                    {tVen('grossSpace') || 'Total Area'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                    {totalFloorArea.toLocaleString()} m²
                  </span>
                </div>
              </div>
              {/* Conversion actions: anchor to the timetable and transit sections */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href="#venue-events"
                  className={buttonVariants({ variant: 'default', size: 'sm' }) + ' min-h-[44px] gap-1.5 font-semibold'}
                >
                  <span>{tVen('viewScheduledEvents', { count: upcomingEvents.length })}</span>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="#venue-transit"
                  className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' min-h-[44px] gap-1.5 font-semibold'}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{tVen('gettingThere')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky conversion bar: sits above the bottom navigation */}
      <div className="md:hidden fixed inset-x-3 bottom-[72px] z-30">
        <Link
          href="#venue-events"
          className={buttonVariants({ variant: 'default', size: 'sm' }) + ' w-full min-h-[44px] gap-1.5 font-semibold shadow-lg'}
        >
          <span>{tVen('viewScheduledEvents', { count: upcomingEvents.length })}</span>
          <ArrowDown className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Campus Spatial Topology & Hall Specifications Explorer */}
      <section className="container">
        <VenueCampusExplorer
          venueName={venue.name}
          venueSlug={venue.slug}
          halls={venueHalls}
        />
      </section>

      {/* Meeting Rooms: listed deeper behind a collapse filter, never counted as halls */}
      {venueMeetingRooms.length > 0 && (
        <VenueMeetingRooms rooms={venueMeetingRooms} title={tVen('meetingRooms')} />
      )}

      {/* Structured Multi-Modal Transit & Logistics Hub */}
      <section id="venue-transit" className="container scroll-mt-20">
        <VenueTransitHub
          venueName={venue.name}
          address={venue.address}
          transitInfo={venue.transitInfo}
          city={venue.city}
          regionCode={regionCode}
        />
      </section>

      {/* Specialized In-Venue Timetable & Scheduled Exhibitions */}
      <section id="venue-events" className="container scroll-mt-20">
        <VenueScheduleTable
          venueName={venue.name}
          events={upcomingEvents}
          locale={locale}
          regionCode={regionCode.toLowerCase()}
        />
      </section>
    </div>
  );
}
