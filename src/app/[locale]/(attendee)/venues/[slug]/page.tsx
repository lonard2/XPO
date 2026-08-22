import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Building2,
  MapPin,
  Train,
  Layers,
  Users,
  Calendar,
  ArrowLeft,
  Navigation,
  Globe,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { EventCard } from '@/components/discovery/EventCard';
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
    ? `Explore hall specifications, floor maps, rapid transit routes, and upcoming exhibitions at ${venue.name}.`
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

      {/* Hall Directory & Specifications */}
      <section className="container px-4 space-y-6">
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>{tVen('specifications') || 'Floor Specifications'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {tReg('hallDirectory') || 'Hall & Pavilion Directory'} ({venue.halls?.length || 0})
          </h2>
        </div>

        {venue.halls && venue.halls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venue.halls.map((hall) => (
              <Card key={hall.id} className="border-border/80 bg-card">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {hall.name}
                    </CardTitle>
                    {hall.capacity && (
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        {hall.capacity.toLocaleString()} Pax
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-2 text-xs text-muted-foreground">
                  {hall.floorAreaSqm && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                      <Layers className="h-3 w-3 text-primary" />
                      <span>{hall.floorAreaSqm.toLocaleString()} sqm {tVen('grossSpace')?.toLowerCase() || 'floor area'}</span>
                    </div>
                  )}
                  {hall.description && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {hall.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{tCom('notFound') || 'No individual hall specs indexed for this venue.'}</p>
        )}
      </section>

      {/* Transit & Access Guide */}
      <section className="container px-4">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Train className="h-4 w-4" />
            <span>{tVen('transitLogistics') || 'Transit & Access Logistics'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {tReg('transitGuide') || 'Getting to Venue'}: {venue.name}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {venue.transitInfo}
          </p>

          {/* Interactive Navigation Widget */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold cursor-pointer">
                <Navigation className="h-3.5 w-3.5 text-primary" />
                <span>{tCom('directions') || 'Open in Google Maps'}</span>
                <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Scheduled Exhibitions at this Venue */}
      <section className="container px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>{tReg('upcomingEvents') || 'Upcoming Schedule'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {tVen('happeningAtVenue') || 'Scheduled Exhibitions at this Venue'}
            </h2>
          </div>
          <Link href={`/${locale}/events`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <span>{tCom('viewAll') || 'All Exhibitions'}</span>
            </Button>
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">{tCom('notFound') || 'No upcoming exhibitions currently scheduled'}</h3>
            <p className="text-xs text-muted-foreground">{tReg('subtitle') || 'Check back soon for new trade fair announcements at this venue.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
