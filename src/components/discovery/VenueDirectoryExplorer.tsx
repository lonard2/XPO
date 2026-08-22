'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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

  let tReg: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tReg = useTranslations('regions');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const [selectedRegion, setSelectedRegion] = React.useState<string>(() => {
    return searchParams.get('region') || initialRegion || 'id';
  });
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Synchronize when URL searchParams change externally (e.g. via RegionSwitcher)
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
            onClick={() => handleSelectRegion('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>{tReg('global.name') ? `${tCom('all') || 'All'} ${tReg('title') || 'Regions'}` : 'All Regions'}</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {venues.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRegion('id')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'id'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tReg('id.name') || 'Indonesia'} (ID)</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {indonesianCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRegion('jp')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'jp'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tReg('jp.name') || 'Japan'} (JP)</span>
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.2 rounded bg-muted">
              {japanCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRegion('global')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              selectedRegion === 'global'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tReg('global.name') || 'Global Gateways'}</span>
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
              handleSelectRegion('all');
              setSearchQuery('');
            }}
            className="text-xs"
          >
            {tCom('clear') || 'Reset Filters'}
          </Button>
        </div>
      )}
    </div>
  );
}
