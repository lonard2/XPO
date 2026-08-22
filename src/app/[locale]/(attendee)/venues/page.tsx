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
import { VenueDirectoryExplorer } from '@/components/discovery/VenueDirectoryExplorer';
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

      {/* Interactive Venue Directory Explorer with Region Filters & Live Search */}
      <section className="container px-4">
        <VenueDirectoryExplorer venues={venuesList} locale={locale} />
      </section>
    </div>
  );
}
