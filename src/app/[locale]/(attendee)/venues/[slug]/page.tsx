import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Building2,
  MapPin,
  ArrowLeft,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/Badge';
import { VenueCampusExplorer } from '@/components/discovery/VenueCampusExplorer';
import { VenueTransitHub } from '@/components/discovery/VenueTransitHub';
import { VenueScheduleTable } from '@/components/discovery/VenueScheduleTable';
import { FALLBACK_VENUES, FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { type VenueSummary, type DiscoveryEvent } from '@/types/discovery';

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
  const { slug } = await params;
  const venue = FALLBACK_VENUES.find((v) => v.slug === slug);
  const title = venue ? `${venue.name} | XPO Venue Hub` : 'Venue Hub | XPO';
  const description = venue
    ? `Explore hall specifications, spatial campus topology, rapid transit routes, and upcoming exhibitions at ${venue.name}.`
    : 'MICE Venue Specifications and upcoming events.';

  return {
    title,
    description,
  };
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tVen = await getTranslations({ locale, namespace: 'venues' });
  const tCom = await getTranslations({ locale, namespace: 'common' });
  const tReg = await getTranslations({ locale, namespace: 'regions' });
  const tFoot = await getTranslations({ locale, namespace: 'footer' });

  let venue: VenueSummary | null = null;
  let upcomingEvents: DiscoveryEvent[] = [];

  try {
    const dbVenue = await db.venue.findUnique({
      where: { slug },
      include: {
        halls: true,
        region: true,
        events: {
          include: {
            venue: true,
            ticketTiers: true,
            region: true,
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (dbVenue) {
      venue = dbVenue as unknown as VenueSummary;
      upcomingEvents = (dbVenue.events as unknown as DiscoveryEvent[]) || [];
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
  const totalCapacity = venue.halls?.reduce((acc, h) => acc + (h.capacity || 0), 0) || 25000;
  const totalFloorArea = venue.halls?.reduce((acc, h) => acc + (h.floorAreaSqm || 0), 0) || 30000;

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container flex items-center gap-2 text-xs text-muted-foreground px-4">
          <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tCom('explore') || 'Home'}</span>
          </Link>
          <span>/</span>
          <Link href={`/${locale}/venues`} className="hover:text-foreground">
            {tVen('title')?.split('&')?.[0]?.trim() || 'Venues'}
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{venue.name}</span>
        </div>
      </div>

      {/* Hero Venue Header Banner */}
      <section className="container px-4">
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
                  {regionCode} Hub
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {venue.city}
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
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    {tVen('totalHalls')?.split(' ')?.[1] || 'Halls'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                    {venue.halls?.length || 4}
                  </span>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-center">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    {tReg('capacity') || 'Max Capacity'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                    {totalCapacity.toLocaleString()}
                  </span>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-center">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    {tVen('grossSpace') || 'Total Area'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block">
                    {totalFloorArea.toLocaleString()} m²
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Spatial Topology & Hall Specifications Explorer */}
      <section className="container px-4">
        <VenueCampusExplorer
          venueName={venue.name}
          halls={venue.halls || []}
        />
      </section>

      {/* Structured Multi-Modal Transit & Logistics Hub */}
      <section className="container px-4">
        <VenueTransitHub
          venueName={venue.name}
          address={venue.address}
          transitInfo={venue.transitInfo}
          city={venue.city}
          regionCode={regionCode}
        />
      </section>

      {/* Specialized In-Venue Timetable & Scheduled Exhibitions */}
      <section className="container px-4">
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
