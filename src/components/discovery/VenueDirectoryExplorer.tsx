'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Train,
  Layers,
  Search,
  Globe2,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { VenueSpotlightCard } from '@/components/discovery/VenueSpotlightCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { type VenueSummary } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface VenueDirectoryExplorerProps {
  venues: VenueSummary[];
  locale: string;
  initialRegion?: string;
}

export function VenueDirectoryExplorer({
  venues,
  locale,
  initialRegion = 'all',
}: VenueDirectoryExplorerProps) {
  const [selectedRegion, setSelectedRegion] = React.useState<string>(initialRegion);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const indonesianCount = venues.filter(
    (v) => (v.region?.code || v.regionId || '').toLowerCase() === 'id'
  ).length;
  const japanCount = venues.filter(
    (v) => (v.region?.code || v.regionId || '').toLowerCase() === 'jp'
  ).length;
  const globalCount = venues.filter((v) =>
    ['gl', 'global'].includes((v.region?.code || v.regionId || '').toLowerCase())
  ).length;

  const filteredVenues = React.useMemo(() => {
    return venues.filter((v) => {
      const code = (v.region?.code || v.regionId || '').toLowerCase();
      const matchesRegion =
        selectedRegion === 'all' ||
        (selectedRegion === 'id' && code === 'id') ||
        (selectedRegion === 'jp' && code === 'jp') ||
        (selectedRegion === 'global' && ['gl', 'global'].includes(code));

      if (!matchesRegion) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const nameMatch = v.name.toLowerCase().includes(q);
      const cityMatch = v.city.toLowerCase().includes(q);
      const addressMatch = (v.address || '').toLowerCase().includes(q);
      const transitMatch = (v.transitInfo || '').toLowerCase().includes(q);
      const hallsMatch = (v.halls || []).some((h) => h.name.toLowerCase().includes(q));

      return nameMatch || cityMatch || addressMatch || transitMatch || hallsMatch;
    });
  }, [venues, selectedRegion, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Controls Bar: Search & Region Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
        {/* Region Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setSelectedRegion('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>All Regions</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {venues.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('id')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'id'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Indonesia (ID)</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {indonesianCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('jp')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'jp'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Japan (JP)</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {japanCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('global')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'global'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Global Gateways</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {globalCount}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search venue, city, or hall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconPrefix={<Search className="h-4 w-4" />}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* Venues Grid Display */}
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueSpotlightCard key={venue.id} venue={venue} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Venues Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            No convention centers match your current region and search criteria. Try adjusting your query or resetting filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRegion('all');
              setSearchQuery('');
            }}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
