'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowRight,
  Globe,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VenueSpotlightCard } from '@/components/discovery/VenueSpotlightCard';
import { type VenueSummary } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface VenueSpotlightSectionProps {
  venues: VenueSummary[];
  locale: string;
  className?: string;
}

export function VenueSpotlightSection({
  venues,
  locale,
  className,
}: VenueSpotlightSectionProps) {
  const [activeRegionFilter, setActiveRegionFilter] = React.useState<'all' | 'id' | 'jp' | 'global'>('all');

  const filteredVenues = React.useMemo(() => {
    if (activeRegionFilter === 'all') return venues;
    return venues.filter((v) => {
      const regCode = (v.region?.code || v.regionId || '').toLowerCase();
      if (activeRegionFilter === 'id') return regCode === 'id';
      if (activeRegionFilter === 'jp') return regCode === 'jp';
      if (activeRegionFilter === 'global') return regCode === 'gl' || regCode === 'global';
      return true;
    });
  }, [venues, activeRegionFilter]);

  const regionTabs: Array<{ id: 'all' | 'id' | 'jp' | 'global'; label: string; count: number }> = [
    { id: 'all', label: 'All World Venues', count: venues.length },
    { id: 'id', label: 'Indonesia Hub', count: venues.filter((v) => (v.region?.code || v.regionId || '').toLowerCase() === 'id').length },
    { id: 'jp', label: 'Japan Hub', count: venues.filter((v) => (v.region?.code || v.regionId || '').toLowerCase() === 'jp').length },
    { id: 'global', label: 'Global Gateways', count: venues.filter((v) => ['gl', 'global'].includes((v.region?.code || v.regionId || '').toLowerCase())).length },
  ];

  return (
    <section className={cn('space-y-6', className)} aria-labelledby="venue-spotlight-heading">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            <span>Spotlight Convention Complexes</span>
          </div>
          <h2 id="venue-spotlight-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            World-Class MICE Venues & Mega Halls
          </h2>
        </div>

        <Link href={`/${locale}/venues`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <span>Explore All Venues</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Region Filter Filter Pills */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter venues by regional hub">
        {regionTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeRegionFilter === tab.id}
            onClick={() => setActiveRegionFilter(tab.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
              activeRegionFilter === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-mono',
                activeRegionFilter === tab.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-background text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Venue Grid */}
      {filteredVenues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
          <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No venues found in this region</h3>
          <p className="text-xs text-muted-foreground">Select another region or view all venues.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueSpotlightCard key={venue.id} venue={venue} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
