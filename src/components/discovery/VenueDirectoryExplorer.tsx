'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Building2,
  Search,
  Globe2,
  ArrowUpDown,
  X,
  Compass,
  Check,
} from 'lucide-react';
import { VenueSpotlightCard } from '@/components/discovery/VenueSpotlightCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
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
  initialRegion = 'id',
}: VenueDirectoryExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tReg = useTranslations('regions');
  const tCom = useTranslations('common');
  const tVen = useTranslations('venues');

  const [selectedRegion, setSelectedRegion] = React.useState<string>(() => {
    return searchParams.get('region') || initialRegion || 'id';
  });
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'alpha' | 'capacity' | 'area'>('alpha');

  // Synchronize when URL searchParams change externally
  React.useEffect(() => {
    const reg = searchParams.get('region');
    if (reg && reg !== selectedRegion) {
      setSelectedRegion(reg);
    }
  }, [searchParams, selectedRegion]);

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    if (region !== 'all' && typeof document !== 'undefined') {
      document.cookie = `xpo_region=${region}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (region !== 'all') {
      params.set('region', region);
    } else {
      params.delete('region');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const indonesianCount = venues.filter(
    (v) => (v.region?.code || v.regionId || '').toLowerCase() === 'id'
  ).length;
  const japanCount = venues.filter(
    (v) => (v.region?.code || v.regionId || '').toLowerCase() === 'jp'
  ).length;
  const globalCount = venues.filter((v) =>
    ['gl', 'global'].includes((v.region?.code || v.regionId || '').toLowerCase())
  ).length;

  // Filter venues by region and search query
  const filteredVenues = React.useMemo(() => {
    const results = venues.filter((v) => {
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

    // Apply MICE sorting
    return results.sort((a, b) => {
      if (sortBy === 'capacity') {
        const capA = a.halls?.reduce((sum, h) => sum + (h.capacity || 0), 0) || (a as any).capacity || 0;
        const capB = b.halls?.reduce((sum, h) => sum + (h.capacity || 0), 0) || (b as any).capacity || 0;
        return capB - capA;
      }
      if (sortBy === 'area') {
        const areaA = a.halls?.reduce((sum, h) => sum + (h.floorAreaSqm || 0), 0) || (a as any).floorAreaSqm || 0;
        const areaB = b.halls?.reduce((sum, h) => sum + (h.floorAreaSqm || 0), 0) || (b as any).floorAreaSqm || 0;
        return areaB - areaA;
      }
      return a.name.localeCompare(b.name);
    });
  }, [venues, selectedRegion, searchQuery, sortBy]);

  // Smart cross-region search recovery when 0 results found
  const otherRegionMatches = React.useMemo(() => {
    if (filteredVenues.length > 0 || !searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase();
    const otherMatches: { region: string; regionLabel: string; count: number }[] = [];

    const checkRegion = (codeMatch: (code: string) => boolean, regKey: string, regLabel: string) => {
      if (selectedRegion === regKey) return;
      const count = venues.filter((v) => {
        const code = (v.region?.code || v.regionId || '').toLowerCase();
        if (!codeMatch(code)) return false;
        return (
          v.name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          (v.address || '').toLowerCase().includes(q) ||
          (v.halls || []).some((h) => h.name.toLowerCase().includes(q))
        );
      }).length;

      if (count > 0) {
        otherMatches.push({ region: regKey, regionLabel: regLabel, count });
      }
    };

    checkRegion((c) => c === 'id', 'id', 'Indonesia');
    checkRegion((c) => c === 'jp', 'jp', 'Japan');
    checkRegion((c) => ['gl', 'global'].includes(c), 'global', 'Global Gateways');

    return otherMatches;
  }, [venues, filteredVenues.length, searchQuery, selectedRegion]);

  const regionDisplayName =
    selectedRegion === 'id'
      ? 'Indonesia'
      : selectedRegion === 'jp'
      ? 'Japan'
      : selectedRegion === 'global'
      ? 'Global Gateways'
      : 'All Regions';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar: Search, Region Tabs & Sorting */}
      <div className="space-y-4 p-4 rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Region Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border border-border/60">
            <button
              type="button"
              onClick={() => handleSelectRegion('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                selectedRegion === 'all'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>All Regions</span>
              <span className="text-xs font-mono opacity-80 px-1.5 py-0.5 rounded bg-muted">
                {venues.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRegion('id')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                selectedRegion === 'id'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Indonesia (ID)</span>
              <span className="text-xs font-mono opacity-80 px-1.5 py-0.5 rounded bg-muted">
                {indonesianCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRegion('jp')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                selectedRegion === 'jp'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Japan (JP)</span>
              <span className="text-xs font-mono opacity-80 px-1.5 py-0.5 rounded bg-muted">
                {japanCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRegion('global')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                selectedRegion === 'global'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Global Gateways</span>
              <span className="text-xs font-mono opacity-80 px-1.5 py-0.5 rounded bg-muted">
                {globalCount}
              </span>
            </button>
          </div>

          {/* Search Input & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-72">
              <Input
                aria-label="Search venues, cities, or halls"
                placeholder="Search venue, city, or hall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconPrefix={<Search className="h-4 w-4 text-muted-foreground" />}
                className="h-10 text-xs pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* MICE Sort Selector */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <label htmlFor="venue-sort" className="sr-only">
                Sort venues by
              </label>
              <select
                id="venue-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="alpha">Alphabetical (A - Z)</option>
                <option value="capacity">Largest Capacity (Pax)</option>
                <option value="area">Largest Floor Space (m²)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Result Tally Bar */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground">{filteredVenues.length}</strong> of{' '}
              <strong className="text-foreground">{venues.length}</strong> verified convention complexes
            </span>
            <Badge variant="outline" className="text-[11px] font-mono">
              {regionDisplayName}
            </Badge>
          </div>

          {(searchQuery || selectedRegion !== 'all') && (
            <button
              type="button"
              onClick={() => {
                handleSelectRegion('all');
                setSearchQuery('');
                setSortBy('alpha');
              }}
              className="text-primary hover:underline text-xs font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
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
        <div className="p-12 text-center border border-dashed border-border/80 rounded-3xl bg-card/40 space-y-4">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Venues Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              No convention centers in <strong className="text-foreground">{regionDisplayName}</strong> match &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>

          {/* Cross-Region Search Recovery Prompt */}
          {otherRegionMatches.length > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 max-w-md mx-auto text-xs space-y-2">
              <span className="font-semibold text-foreground block">
                Found matching venues in other regional editions:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {otherRegionMatches.map((m) => (
                  <Button
                    key={m.region}
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectRegion(m.region)}
                    className="text-xs gap-1 cursor-pointer"
                  >
                    <span>View in {m.regionLabel} ({m.count})</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSelectRegion('all');
              setSearchQuery('');
            }}
            className="text-xs cursor-pointer"
          >
            {tCom('clear') || 'Reset Filters'}
          </Button>
        </div>
      )}
    </div>
  );
}
