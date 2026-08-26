import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Building2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { db } from '@/lib/db';
import { VenueDirectoryExplorer } from '@/components/discovery/VenueDirectoryExplorer';
import { FALLBACK_VENUES } from '@/lib/discovery/fallbackData';
import { type VenueSummary } from '@/types/discovery';

export interface VenuesPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: VenuesPageProps) {
  const { locale } = await params;
  return {
    title: 'Global & Regional MICE Venue Directory | XPO',
    description: 'Explore verified convention centers, exhibition complexes, and arena venues across Indonesia, Japan, and international gateways with exact hall specifications and rapid transit routes.',
  };
}

export default async function VenuesPage({ params, searchParams }: VenuesPageProps) {
  const { locale } = await params;
  const rawSearchParams = searchParams ? await searchParams : undefined;
  setRequestLocale(locale);

  const tVen = await getTranslations({ locale, namespace: 'venues' });
  const tCom = await getTranslations({ locale, namespace: 'common' });
  const tFoot = await getTranslations({ locale, namespace: 'footer' });

  const headerList = await headers();
  const cookieStore = await cookies();
  const geoHeaderRegion = headerList.get('x-xpo-region');
  const cookieRegion = cookieStore.get('xpo_region')?.value;

  const defaultRegion = (cookieRegion || geoHeaderRegion || 'id').toLowerCase();
  const explicitRegion = typeof rawSearchParams?.region === 'string' ? rawSearchParams.region : undefined;
  const activeRegion = explicitRegion || defaultRegion;

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

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="border-b border-border bg-muted/30 py-3">
        <ol className="container flex items-center gap-2 text-xs text-muted-foreground px-4">
          <li>
            <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{tCom('explore') || 'Home'}</span>
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-foreground">
            {tVen('title')?.split('&')?.[0]?.trim() || 'Venue Directory'}
          </li>
        </ol>
      </nav>

      {/* Hero Header Section */}
      <section className="container px-4">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{tFoot('infrastructureBadge') || 'Verified MICE Infrastructure'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              {tVen('title') || 'Convention Centers & Exhibition Halls'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tVen('subtitle') || 'Explore verified floor capacities, column-free mega halls, VIP delegation suites, and transit access guides for world-class venues in Southeast Asia, Japan, and international trade gateways.'}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Venue Directory Explorer with Region Filters & Live Search */}
      <section className="container px-4">
        <VenueDirectoryExplorer venues={venuesList} locale={locale} initialRegion={activeRegion} />
      </section>
    </div>
  );
}
