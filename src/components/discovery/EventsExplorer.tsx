'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EventCard } from '@/components/discovery/EventCard';
import { FacetedFilterBar } from '@/components/discovery/FacetedFilterBar';
import { FilterSidebar } from '@/components/discovery/FilterSidebar';
import { useTranslations } from 'next-intl';
import { type DiscoveryEvent, type FilterState } from '@/types/discovery';

export interface EventsExplorerProps {
  initialEvents: DiscoveryEvent[];
  locale: string;
  initialFilters?: Partial<FilterState>;
}

export function EventsExplorer({
  initialEvents,
  locale,
  initialFilters,
}: EventsExplorerProps) {
  let tDisc: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tDisc = useTranslations('discovery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
  } catch {
    // Fallback
  }

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query params on initial load
  const parseQueryFilters = React.useCallback((): FilterState => {
    const q = searchParams.get('q') || initialFilters?.keyword || '';
    const region = searchParams.get('region') || initialFilters?.region || 'all';
    const city = searchParams.get('city') || initialFilters?.city || 'all';
    const archetype = searchParams.get('archetype') || initialFilters?.archetype || 'all';
    const format = searchParams.get('format') || initialFilters?.format || 'all';
    const scale = searchParams.get('scale') || initialFilters?.scale || 'all';
    const dateRange = searchParams.get('dateRange') || initialFilters?.dateRange || 'all';

    return { keyword: q, region, city, archetype, format, scale, dateRange };
  }, [searchParams, initialFilters]);

  const [filters, setFilters] = React.useState<FilterState>(parseQueryFilters);
  const [sortBy, setSortBy] = React.useState<string>(() => searchParams.get('sortBy') || 'date_asc');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Synchronize region filter if URL searchParams change externally (e.g. via RegionSwitcher)
  React.useEffect(() => {
    const regionParam = searchParams.get('region');
    if (regionParam && regionParam !== filters.region) {
      setFilters((prev) => ({ ...prev, region: regionParam }));
    }
  }, [searchParams, filters.region]);

  // Sync state to URL without reloading the page
  const updateUrlQuery = React.useCallback(
    (newFilters: FilterState, newSort: string) => {
      const params = new URLSearchParams();

      if (newFilters.keyword.trim()) params.set('q', newFilters.keyword.trim());
      if (newFilters.region !== 'all') params.set('region', newFilters.region);
      if (newFilters.city !== 'all') params.set('city', newFilters.city);
      if (newFilters.archetype !== 'all') params.set('archetype', newFilters.archetype);
      if (newFilters.format !== 'all') params.set('format', newFilters.format);
      if (newFilters.scale !== 'all') params.set('scale', newFilters.scale);
      if (newFilters.dateRange !== 'all') params.set('dateRange', newFilters.dateRange);
      if (newSort !== 'date_asc') params.set('sortBy', newSort);

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.region !== 'all' && typeof document !== 'undefined') {
      document.cookie = `xpo_region=${newFilters.region}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
    updateUrlQuery(newFilters, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateUrlQuery(filters, newSort);
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterState = {
      keyword: '',
      region: 'all',
      city: 'all',
      archetype: 'all',
      format: 'all',
      scale: 'all',
      dateRange: 'all',
    };
    setFilters(emptyFilters);
    updateUrlQuery(emptyFilters, sortBy);
  };

  // Filter and Sort Events
  const filteredAndSortedEvents = React.useMemo(() => {
    return initialEvents.filter((event) => {
      // 1. Keyword search (title, tagline, description, venue, city)
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase().trim();
        const titleMatch = event.title.toLowerCase().includes(query);
        const taglineMatch = event.tagline?.toLowerCase().includes(query) ?? false;
        const descMatch = event.description.toLowerCase().includes(query);
        const venueMatch = event.venue?.name.toLowerCase().includes(query) ?? false;
        const cityMatch = event.venue?.city.toLowerCase().includes(query) ?? false;

        if (!titleMatch && !taglineMatch && !descMatch && !venueMatch && !cityMatch) {
          return false;
        }
      }

      // 2. Region Hub filter
      if (filters.region !== 'all') {
        const targetRegion = filters.region.toLowerCase();
        const eventRegion = (event.region?.code || event.regionId || '').toLowerCase();
        if (targetRegion === 'id' && eventRegion !== 'id') return false;
        if (targetRegion === 'jp' && eventRegion !== 'jp') return false;
        if (targetRegion === 'global' && !['gl', 'global'].includes(eventRegion)) return false;
      }

      // 3. City filter
      if (filters.city !== 'all') {
        if (event.venue?.city.toLowerCase() !== filters.city.toLowerCase()) {
          return false;
        }
      }

      // 4. MICE Category Archetype filter
      if (filters.archetype !== 'all') {
        if (event.archetype.toUpperCase() !== filters.archetype.toUpperCase()) {
          return false;
        }
      }

      // 5. Event Format filter
      if (filters.format !== 'all') {
        if (event.format.toUpperCase() !== filters.format.toUpperCase()) {
          return false;
        }
      }

      // 6. Scale filter
      if (filters.scale !== 'all') {
        if (event.scale.toUpperCase() !== filters.scale.toUpperCase()) {
          return false;
        }
      }

      // 7. Date Range filter
      if (filters.dateRange !== 'all') {
        const eventStart = new Date(event.startDate).getTime();
        const now = Date.now();
        if (filters.dateRange === 'upcoming') {
          if (eventStart < now - 1000 * 60 * 60 * 24 * 30) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      if (sortBy === 'date_desc') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      if (sortBy === 'featured') {
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [initialEvents, filters, sortBy]);

  // Compute category / region counts
  const categoryCounts = React.useMemo(() => {
    const archetypes: Record<string, number> = {};
    const regions: Record<string, number> = { all: initialEvents.length, id: 0, jp: 0, global: 0 };

    for (const evt of initialEvents) {
      const arch = evt.archetype.toUpperCase();
      archetypes[arch] = (archetypes[arch] || 0) + 1;

      const reg = (evt.region?.code || evt.regionId || '').toLowerCase();
      if (reg === 'id') regions.id++;
      if (reg === 'jp') regions.jp++;
      if (reg === 'gl' || reg === 'global') regions.global++;
    }

    return { archetypes, regions };
  }, [initialEvents]);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Faceted Filter & Search Toolbar */}
      <section className="container px-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <FacetedFilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={filteredAndSortedEvents.length}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
          />
        </div>
      </section>

      {/* Main Content Grid: Desktop Sidebar + Event Grid */}
      <section className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              counts={categoryCounts}
            />
          </aside>

          {/* Right Event Grid */}
          <main className="lg:col-span-9 space-y-6">
            {filteredAndSortedEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-10 sm:p-14 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {tDisc('noMatchingTitle') || tDisc('noEventsFound') || 'No matching exhibitions found'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {tDisc('noMatchingDesc') || 'We could not find any events matching your selected criteria. Try adjusting keywords or clearing active filters.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="gap-2 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{tDisc('resetFilters') || tDisc('clearFilters') || 'Reset All Filters'}</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} locale={locale} />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Mobile / Tablet Filter Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title={tDisc('filterEvents') || 'Filter & Refine Events'}
        description={tDisc('filterByRegion') || 'Filter exhibitions by region, archetype category, format, and scale.'}
        side="bottom"
      >
        <div className="pb-6">
          <FilterSidebar
            filters={filters}
            onChange={(newFilters) => {
              handleFilterChange(newFilters);
            }}
            onReset={() => {
              handleResetFilters();
              setIsMobileDrawerOpen(false);
            }}
            counts={categoryCounts}
          />
          <div className="pt-6 border-t border-border mt-6">
            <Button
              className="w-full font-semibold cursor-pointer"
              onClick={() => setIsMobileDrawerOpen(false)}
            >
              {tDisc('applyFilters') || 'Apply Filters'} ({filteredAndSortedEvents.length} {tDisc('exhibitionsCount') || 'Results'})
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
