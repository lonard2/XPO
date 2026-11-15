'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Calendar,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Search,
  Scale,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateRange, type SupportedCurrency } from '@/lib/i18n/formatters';
import { Drawer } from '@/components/ui/Drawer';
import { EventCard } from '@/components/discovery/EventCard';
import { EventTableView } from '@/components/discovery/EventTableView';
import { FacetedFilterBar } from '@/components/discovery/FacetedFilterBar';
import { FilterSidebar } from '@/components/discovery/FilterSidebar';
import { EventCompareDialog } from '@/components/discovery/EventCompareDialog';
import { useTranslations } from 'next-intl';
import { DATE_RANGE_IDS, matchesDateRange } from '@/lib/discovery/dateFilters';
import { type DiscoveryEvent, type FilterState } from '@/types/discovery';

export interface EventsExplorerProps {
  initialEvents: DiscoveryEvent[];
  locale: string;
  initialFilters?: Partial<FilterState>;
  /** Edition the page is anchored to, for example "id". */
  editionRegion?: string;
  /** True when the initial region is the edition context, not an explicit filter. */
  regionIsEdition?: boolean;
  /** Human label for the edition context, for example "Indonesia edition". */
  editionLabel?: string | null;
  /** Date scope restored by Reset All Filters. */
  defaultDateRange?: string;
}

export const INITIAL_PAGE_SIZE = 12;
export const PAGE_SIZE_INCREMENT = 12;

/**
 * Shared facet predicate. `ignore` lets the facet counts relax one group at a
 * time, so a rail can show what is reachable without the current selection.
 */
function matchesFilters(
  event: DiscoveryEvent,
  filters: FilterState,
  ignore?: keyof FilterState
): boolean {
  if (ignore !== 'keyword' && filters.keyword.trim()) {
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

  if (ignore !== 'region' && filters.region !== 'all') {
    const targetRegion = filters.region.toLowerCase();
    const eventRegion = (event.region?.code || event.regionId || '').toLowerCase();
    if (targetRegion === 'id' && eventRegion !== 'id') return false;
    if (targetRegion === 'jp' && eventRegion !== 'jp') return false;
    if (targetRegion === 'global' && !['gl', 'global'].includes(eventRegion)) return false;
  }

  if (ignore !== 'city' && filters.city !== 'all') {
    const targetCity = filters.city.toLowerCase().trim();
    const eventCity = event.venue?.city?.toLowerCase().trim() || '';
    if (eventCity !== targetCity && !eventCity.includes(targetCity)) {
      return false;
    }
  }

  if (ignore !== 'archetype' && filters.archetype !== 'all') {
    const selectedArchetypes = filters.archetype
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (
      selectedArchetypes.length > 0 &&
      !selectedArchetypes.includes(event.archetype.toUpperCase())
    ) {
      return false;
    }
  }

  if (ignore !== 'format' && filters.format !== 'all') {
    if (event.format.toUpperCase() !== filters.format.toUpperCase()) {
      return false;
    }
  }

  if (ignore !== 'scale' && filters.scale !== 'all') {
    if (event.scale.toUpperCase() !== filters.scale.toUpperCase()) {
      return false;
    }
  }

  if (ignore !== 'dateRange' && !matchesDateRange(event, filters.dateRange)) {
    return false;
  }

  return true;
}

export function EventsExplorer({
  initialEvents,
  locale,
  initialFilters,
  editionRegion = 'id',
  regionIsEdition = false,
  editionLabel = null,
  defaultDateRange = 'all',
}: EventsExplorerProps) {
  const tDisc = useTranslations('discovery');
  const tCom = useTranslations('common');

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
    const dateRange =
      searchParams.get('dateRange') || initialFilters?.dateRange || defaultDateRange;

    return { keyword: q, region, city, archetype, format, scale, dateRange };
  }, [searchParams, initialFilters, defaultDateRange]);

  const [filters, setFilters] = React.useState<FilterState>(parseQueryFilters);
  const [sortBy, setSortBy] = React.useState<string>(() => searchParams.get('sortBy') || 'date_asc');
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_PAGE_SIZE);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
  // Shortlist compare tray: event ids pinned for side-by-side comparison.
  const [shortlist, setShortlist] = React.useState<string[]>(() => {
    const raw = searchParams.get('compare') || '';
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  });
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [shortlistNotice, setShortlistNotice] = React.useState('');
  const shortlistRef = React.useRef(shortlist);
  React.useEffect(() => {
    shortlistRef.current = shortlist;
  }, [shortlist]);

  const lowestPriceOf = (e: { ticketTiers?: Array<{ price: number }>; lowestPrice?: number }) => {
    if (typeof e.lowestPrice === 'number') return e.lowestPrice;
    if (e.ticketTiers && e.ticketTiers.length > 0) {
      return Math.min(...e.ticketTiers.map((t) => t.price));
    }
    return 0;
  };

  // Price is only comparable inside one currency. Grouping by currency keeps
  // IDR, JPY, and USD from being subtracted as if they shared a unit.
  const currencyOf = (event: DiscoveryEvent): string => {
    const tierCurrency = event.ticketTiers?.find((tier) => tier.currency)?.currency;
    return (tierCurrency || event.region?.currency || 'IDR').toUpperCase();
  };

  const toggleShortlist = (id: string) => {
    const event = initialEvents.find((candidate) => candidate.id === id);
    const title = event?.title || '';
    const current = shortlistRef.current;

    if (!current.includes(id) && current.length >= 4) {
      setShortlistNotice(
        tDisc('compareFull') ||
          'Comparison is full (4 of 4). Remove an event to add another.'
      );
      return;
    }

    const removing = current.includes(id);
    const next = removing ? current.filter((x) => x !== id) : [...current, id];
    shortlistRef.current = next;
    setShortlist(next);
    setShortlistNotice(
      removing
        ? tDisc('compareRemoved', { title }) || `${title} removed from comparison.`
        : tDisc('compareAdded', { title }) || `${title} added to comparison.`
    );

    const params = new URLSearchParams(window.location.search);
    if (next.length > 0) params.set('compare', next.join(','));
    else params.delete('compare');
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`
    );
  };

  // Reset pagination when filters or sort change
  React.useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [filters, sortBy]);

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
      // Serialize "all" explicitly so a shared or reloaded URL does not snap
      // back to the edition region. The edition itself stays implicit: sorting
      // or searching must not turn context into a chip the delegate never chose.
      const regionIsStillEdition =
        regionIsEdition && newFilters.region === editionRegion;
      if (!regionIsStillEdition) params.set('region', newFilters.region);
      if (newFilters.city !== 'all') params.set('city', newFilters.city);
      if (newFilters.archetype !== 'all') params.set('archetype', newFilters.archetype);
      if (newFilters.format !== 'all') params.set('format', newFilters.format);
      if (newFilters.scale !== 'all') params.set('scale', newFilters.scale);
      if (newFilters.dateRange !== defaultDateRange) params.set('dateRange', newFilters.dateRange);
      if (newSort !== 'date_asc') params.set('sortBy', newSort);

      // Filtering must not discard an in-progress shortlist.
      const currentCompare = new URLSearchParams(window.location.search).get('compare');
      if (currentCompare) params.set('compare', currentCompare);

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, defaultDateRange, regionIsEdition, editionRegion]
  );

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (typeof document !== 'undefined') {
      if (newFilters.region === 'all') {
        document.cookie = 'xpo_region=; path=/; max-age=0; SameSite=Lax';
      } else {
        document.cookie = `xpo_region=${newFilters.region}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      }
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
      dateRange: defaultDateRange,
    };
    if (typeof document !== 'undefined') {
      document.cookie = 'xpo_region=; path=/; max-age=0; SameSite=Lax';
    }
    setFilters(emptyFilters);
    updateUrlQuery(emptyFilters, sortBy);
  };

  // Filter and Sort Events
  const filteredAndSortedEvents = React.useMemo(() => {
    return initialEvents
      .filter((event) => matchesFilters(event, filters))
      .sort((a, b) => {
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
        if (sortBy === 'price_asc' || sortBy === 'price_desc') {
          const currencyA = currencyOf(a);
          const currencyB = currencyOf(b);
          if (currencyA !== currencyB) return currencyA.localeCompare(currencyB);
          const pa = lowestPriceOf(a);
          const pb = lowestPriceOf(b);
          return sortBy === 'price_asc' ? pa - pb : pb - pa;
        }
        if (sortBy === 'ending_soon') {
          // Active runs come first; concluded runs only appear when the delegate
          // opts into past events, and then they trail the list.
          const now = Date.now();
          const aPast = new Date(a.endDate).getTime() < now;
          const bPast = new Date(b.endDate).getTime() < now;
          if (aPast !== bPast) return aPast ? 1 : -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        }
        return 0;
      });
  }, [initialEvents, filters, sortBy]);

  // Facet counts are scoped: each group relaxes its own selection so the rail
  // reports what is reachable without the current choice, not global inventory.
  const categoryCounts = React.useMemo(() => {
    const archetypes: Record<string, number> = {};
    const regions: Record<string, number> = { all: 0, id: 0, jp: 0, global: 0 };
    const formats: Record<string, number> = { IN_PERSON: 0, HYBRID: 0, VIRTUAL: 0 };
    const scales: Record<string, number> = {
      GLOBAL_MEGA: 0,
      LARGE: 0,
      MEDIUM: 0,
      EXECUTIVE: 0,
    };
    const cities: Record<string, number> = {};
    const dates: Record<string, number> = {};

    for (const evt of initialEvents) {
      if (matchesFilters(evt, filters, 'region')) {
        regions.all += 1;
        const reg = (evt.region?.code || evt.regionId || '').toLowerCase();
        if (reg === 'id') regions.id += 1;
        if (reg === 'jp') regions.jp += 1;
        if (reg === 'gl' || reg === 'global') regions.global += 1;
      }

      if (matchesFilters(evt, filters, 'archetype')) {
        const arch = evt.archetype.toUpperCase();
        archetypes[arch] = (archetypes[arch] || 0) + 1;
      }

      if (matchesFilters(evt, filters, 'format')) {
        const format = evt.format.toUpperCase();
        formats[format] = (formats[format] || 0) + 1;
      }

      if (matchesFilters(evt, filters, 'scale')) {
        const scale = evt.scale.toUpperCase();
        scales[scale] = (scales[scale] || 0) + 1;
      }

      if (matchesFilters(evt, filters, 'city') && evt.venue?.city) {
        const city = evt.venue.city;
        cities[city] = (cities[city] || 0) + 1;
      }

      for (const dateId of DATE_RANGE_IDS) {
        if (matchesFilters(evt, { ...filters, dateRange: dateId })) {
          dates[dateId] = (dates[dateId] || 0) + 1;
        }
      }
    }

    return { archetypes, regions, formats, scales, cities, dates };
  }, [initialEvents, filters]);

  // Compute distinct available cities from events, scoped to active region
  const availableCities = React.useMemo(() => {
    const citiesSet = new Set<string>();
    for (const evt of initialEvents) {
      if (filters.region !== 'all') {
        const targetRegion = filters.region.toLowerCase();
        const eventRegion = (evt.region?.code || evt.regionId || '').toLowerCase();
        const matchesRegion =
          (targetRegion === 'id' && eventRegion === 'id') ||
          (targetRegion === 'jp' && eventRegion === 'jp') ||
          (targetRegion === 'global' && ['gl', 'global'].includes(eventRegion));
        if (!matchesRegion) continue;
      }
      if (evt.venue?.city) {
        citiesSet.add(evt.venue.city);
      }
    }
    return Array.from(citiesSet).sort((a, b) => a.localeCompare(b));
  }, [initialEvents, filters.region]);

  const displayedEvents = React.useMemo(() => {
    return filteredAndSortedEvents.slice(0, visibleCount);
  }, [filteredAndSortedEvents, visibleCount]);

  // The edition is context, not a filter the delegate applied. It stops being
  // context once the delegate explicitly chooses another region or all regions.
  const regionIsEditionContext = Boolean(regionIsEdition) && filters.region === editionRegion;
  const editionContextLabel = filters.region === 'all' ? null : editionLabel;

  // When the combination yields nothing, name the one filter that would restore
  // results instead of blaming "keywords" unconditionally.
  const nearestMatch = React.useMemo(() => {
    if (filteredAndSortedEvents.length > 0) return null;

    const keys: Array<keyof FilterState> = [
      'keyword',
      'region',
      'city',
      'archetype',
      'format',
      'scale',
      'dateRange',
    ];
    const isActive = (key: keyof FilterState) => {
      if (key === 'keyword') return filters.keyword.trim().length > 0;
      if (key === 'region') return filters.region !== 'all' && !regionIsEditionContext;
      if (key === 'dateRange') {
        return filters.dateRange !== 'all' && filters.dateRange !== defaultDateRange;
      }
      return filters[key] !== 'all';
    };

    for (const key of keys) {
      if (!isActive(key)) continue;
      const relaxed: FilterState = {
        ...filters,
        [key]: key === 'keyword' ? '' : 'all',
      };
      const count = initialEvents.filter((event) => matchesFilters(event, relaxed)).length;
      if (count > 0) return { key, count };
    }
    return null;
  }, [
    filteredAndSortedEvents.length,
    initialEvents,
    filters,
    regionIsEditionContext,
    defaultDateRange,
  ]);

  const nearestFilterLabel = nearestMatch
    ? {
        keyword: tDisc('filterByKeyword') || 'Keyword Search',
        region: tDisc('filterByRegion') || 'Country Edition',
        city: tDisc('city') || 'City',
        archetype: tDisc('filterByArchetype') || 'Event Category',
        format: tDisc('format') || 'Format',
        scale: tDisc('scale') || 'Scale',
        dateRange: tDisc('dateRange') || 'Date Range',
      }[nearestMatch.key]
    : '';

  const compareEvents = React.useMemo(
    () =>
      shortlist
        .map((id) => initialEvents.find((event) => event.id === id))
        .filter((event): event is DiscoveryEvent => Boolean(event)),
    [shortlist, initialEvents]
  );

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Faceted Filter & Search Toolbar */}
      <section className="container">
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <FacetedFilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={filteredAndSortedEvents.length}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            editionLabel={editionContextLabel}
            regionIsEdition={regionIsEditionContext}
            defaultDateRange={defaultDateRange}
          />
        </div>
      </section>

      {/* Main Content Grid: Desktop Sidebar + Event Grid */}
      <section className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              availableCities={availableCities}
              counts={categoryCounts}
              regionIsEdition={regionIsEditionContext}
              defaultDateRange={defaultDateRange}
            />
          </aside>

          {/* Right Event Grid or Table */}
          <main className="lg:col-span-9 space-y-6">
            <h2 className="sr-only">{tDisc('resultsHeading') || 'Event results'}</h2>
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
                  {nearestMatch && (
                    <p className="text-xs font-medium text-foreground">
                      {tDisc('nearestMatch', {
                        count: nearestMatch.count,
                        filter: nearestFilterLabel,
                      })}
                    </p>
                  )}
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
            ) : viewMode === 'table' ? (
              <div className="space-y-6">
                <EventTableView
                  events={displayedEvents}
                  locale={locale}
                  shortlistedIds={shortlist}
                  onToggleShortlist={toggleShortlist}
                  shortlistLabel={tDisc('shortlistCompare') || 'Compare this event'}
                />
                {visibleCount < filteredAndSortedEvents.length && (
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
                    <p className="text-xs text-muted-foreground font-mono">
                      {tDisc('showingCount', {
                        shown: displayedEvents.length,
                        total: filteredAndSortedEvents.length,
                      })}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE_INCREMENT)}
                      className="gap-2 text-xs font-semibold cursor-pointer w-full sm:w-auto"
                    >
                      <span>{tDisc('loadMore')}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        (+{Math.min(PAGE_SIZE_INCREMENT, filteredAndSortedEvents.length - visibleCount)})
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
                  {displayedEvents.map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      locale={locale}
                      priority={idx < 3}
                      shortlisted={shortlist.includes(event.id)}
                      onToggleShortlist={toggleShortlist}
                      shortlistLabel={tDisc('shortlistCompare') || 'Compare this event'}
                    />
                  ))}
                </div>
                {visibleCount < filteredAndSortedEvents.length && (
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
                    <p className="text-xs text-muted-foreground font-mono">
                      {tDisc('showingCount', {
                        shown: displayedEvents.length,
                        total: filteredAndSortedEvents.length,
                      })}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE_INCREMENT)}
                      className="gap-2 text-xs font-semibold cursor-pointer w-full sm:w-auto"
                    >
                      <span>{tDisc('loadMore')}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        (+{Math.min(PAGE_SIZE_INCREMENT, filteredAndSortedEvents.length - visibleCount)})
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Shortlist compare tray */}
      {shortlist.length > 0 && (
        <div
          role="region"
          aria-label={tDisc('shortlistCompareTitle') || 'Event shortlist comparison'}
          className="fixed bottom-20 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6 sm:w-[440px] z-40 max-h-[60vh] overflow-y-auto rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl p-4 space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>{tDisc('shortlistCompareTitle') || 'Compare Events'} ({shortlist.length}/4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={() => setCompareOpen(true)}
                disabled={shortlist.length < 2}
                className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Scale className="h-3.5 w-3.5" />
                {tDisc('compareAction', { count: shortlist.length }) ||
                  `Compare (${shortlist.length})`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.delete('compare');
                  const query = params.toString();
                  window.history.replaceState(
                    null,
                    '',
                    `${window.location.pathname}${query ? `?${query}` : ''}`
                  );
                  setShortlist([]);
                  setShortlistNotice('');
                }}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {tDisc('clearAll') || 'Clear all'}
              </Button>
            </div>
          </div>
          {shortlistNotice ? (
            <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
              {shortlistNotice}
            </p>
          ) : shortlist.length === 1 ? (
            <p className="text-xs text-muted-foreground">
              {tDisc('compareSelectTwo') || 'Select at least two events to compare.'}
            </p>
          ) : null}
          <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {shortlist.map((id) => {
              const evt = initialEvents.find((e) => e.id === id);
              if (!evt) return null;
              const price = lowestPriceOf(evt);
              return (
                <li key={id} className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card p-2.5 text-xs">
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      href={`/${locale}/events/${evt.slug}`}
                      className="block font-bold text-foreground line-clamp-1 hover:text-primary transition-colors"
                    >
                      {evt.title}
                    </Link>
                    <p className="text-muted-foreground truncate">
                      {(evt as any).venue?.name || ''}{(evt as any).venueHall ? ` • ${(evt as any).venueHall.name}` : ''} · {formatDateRange(evt.startDate, evt.endDate, locale)}
                    </p>
                    <p className="font-semibold text-foreground tabular-nums">
                      {price > 0 ? formatCurrency(price, (((evt as any).ticketTiers?.[0]?.currency || (evt as any).region?.currency || 'IDR')) as SupportedCurrency, locale) : (tDisc('freeAdmission') || 'Free admission')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(id)}
                    aria-label={`${tDisc('shortlistRemove') || 'Remove from comparison'}: ${evt.title}`}
                    className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <EventCompareDialog
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        events={compareEvents}
        locale={locale}
        onRemove={toggleShortlist}
      />

      {/* Mobile / Tablet Filter Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title={tDisc('filterEvents') || 'Filter & Refine Events'}
        description={tDisc('filterDrawerDesc') || 'Filter exhibitions by region, category, format, scale, and date.'}
        side="bottom"
      >
        <div className="flex flex-col max-h-[75vh]">
          <div className="overflow-y-auto pb-4 pr-1 flex-1">
            <FilterSidebar
              filters={filters}
              onChange={(newFilters) => {
                handleFilterChange(newFilters);
              }}
              onReset={() => {
                handleResetFilters();
                setIsMobileDrawerOpen(false);
              }}
              availableCities={availableCities}
              counts={categoryCounts}
              regionIsEdition={regionIsEditionContext}
              defaultDateRange={defaultDateRange}
            />
          </div>
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border pt-3 pb-2 z-10">
            <Button
              className="w-full font-semibold cursor-pointer shadow-md"
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
