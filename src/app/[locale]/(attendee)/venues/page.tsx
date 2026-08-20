import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Train,
  Layers,
  Users,
  ArrowRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { VenueSpotlightCard } from '@/components/discovery/VenueSpotlightCard';
import { FALLBACK_VENUES } from '@/lib/discovery/fallbackData';
import { type VenueSummary } from '@/types/discovery';

export interface VenuesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: VenuesPageProps) {
  const { locale } = await params;
  return {
    title: 'Global & Regional MICE Venue Directory | XPO',
    description: 'Explore verified convention centers, exhibition complexes, and arena venues across Indonesia, Japan, and international gateways with exact hall specifications and rapid transit routes.',
  };
}

export default async function VenuesPage({ params }: VenuesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  let venuesList: VenueSummary[] = FALLBACK_VENUES;

  try {
    const dbVenues = await db.venue.findMany({
      include: {
        halls: true,
        region: true,
      },
      orderBy: { name: 'asc' },
    });

    if (dbVenues.length > 0) {
      venuesList = dbVenues as unknown as VenueSummary[];
    }
  } catch {
    // Graceful fallback to pre-seeded venues
  }

  const indonesianVenues = venuesList.filter((v) => (v.region?.code || v.regionId || '').toLowerCase() === 'id');
  const japanVenues = venuesList.filter((v) => (v.region?.code || v.regionId || '').toLowerCase() === 'jp');
  const globalVenues = venuesList.filter((v) => ['gl', 'global'].includes((v.region?.code || v.regionId || '').toLowerCase()));

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container flex items-center gap-2 text-xs text-muted-foreground px-4">
          <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Venue Directory</span>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="container px-4">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5" />
              <span>Verified MICE Infrastructure</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Convention Centers & Exhibition Halls
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore verified floor capacities, column-free mega halls, VIP delegation suites, and transit access guides for world-class venues in Southeast Asia, Japan, and international trade gateways.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Indonesia Hub Venues */}
      <section className="container px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Globe className="h-4 w-4" />
              <span>Indonesia Regional Hub (ID)</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Jakarta & Tangerang Convention Complexes
            </h2>
          </div>
          <Link href={`/${locale}/region/id`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>View ID Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indonesianVenues.map((venue) => (
            <VenueSpotlightCard key={venue.id} venue={venue} locale={locale} />
          ))}
        </div>
      </section>

      {/* 2. Japan Hub Venues */}
      {japanVenues.length > 0 && (
        <section className="container px-4 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
                <Globe className="h-4 w-4" />
                <span>Japan Regional Hub (JP)</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Tokyo & Kanto Trade Exhibition Centers
              </h2>
            </div>
            <Link href={`/${locale}/region/jp`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>View JP Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {japanVenues.map((venue) => (
              <VenueSpotlightCard key={venue.id} venue={venue} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Global Gateways */}
      {globalVenues.length > 0 && (
        <section className="container px-4 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
                <Globe className="h-4 w-4" />
                <span>Global Hubs (GL)</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                International Flagship Convention Centers
              </h2>
            </div>
            <Link href={`/${locale}/region/global`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>View Global Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalVenues.map((venue) => (
              <VenueSpotlightCard key={venue.id} venue={venue} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
